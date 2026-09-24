const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
    NISAB_GOLD_GRAMS,
    ZAKAT_RATE,
    roundMoney,
    parseAmount,
    validateInputs,
    calculateZakat,
    formatMoney
} = require("./logic.js");

const empty = { goldPrice: 0, cash: 0, goldGrams: 0, silverGrams: 0, silverPrice: 0, tradeGoods: 0, debts: 0 };

test("constants match the usual rulings", () => {
    assert.equal(NISAB_GOLD_GRAMS, 85);
    assert.equal(ZAKAT_RATE, 0.025);
});

test("parses plain, grouped and Arabic-Indic amounts", () => {
    assert.equal(parseAmount("1500"), 1500);
    assert.equal(parseAmount("1,500.50"), 1500.5);
    assert.equal(parseAmount(" 2 000 "), 2000);
    assert.equal(parseAmount("٤٬٠٠٠٫٥"), 4000.5);
    assert.equal(parseAmount(".5"), 0.5);
    assert.equal(parseAmount(""), null);
    assert.equal(parseAmount(undefined), null);
});

test("rejects negative and non-numeric amounts", () => {
    assert.ok(Number.isNaN(parseAmount("-5")));
    assert.ok(Number.isNaN(parseAmount("abc")));
    assert.ok(Number.isNaN(parseAmount("1e5")));
    assert.ok(Number.isNaN(parseAmount("1.2.3")));
});

test("requires a gold price and treats blanks as zero", () => {
    const missing = validateInputs({ cash: "1000" });
    assert.equal(missing.valid, false);
    assert.match(missing.errors.goldPrice, /nisab/);

    const ok = validateInputs({ goldPrice: "4000", cash: "1000" });
    assert.equal(ok.valid, true);
    assert.equal(ok.values.tradeGoods, 0);
    assert.equal(ok.values.debts, 0);
});

test("asks for a silver price only when there is silver", () => {
    assert.equal(validateInputs({ goldPrice: "4000", silverGrams: "0" }).valid, true);
    const result = validateInputs({ goldPrice: "4000", silverGrams: "200" });
    assert.match(result.errors.silverPrice, /silver price/);
});

test("flags every bad field at once", () => {
    const result = validateInputs({ goldPrice: "x", cash: "-1", tradeGoods: "1e99" });
    assert.deepEqual(Object.keys(result.errors).sort(), ["cash", "goldPrice", "tradeGoods"]);
    assert.match(result.errors.goldPrice, /number/);
});

test("zakat is 2.5% of wealth above the nisab", () => {
    const result = calculateZakat({ ...empty, goldPrice: 4000, cash: 300000, goldGrams: 20, tradeGoods: 50000 });
    assert.equal(result.nisab, 340000);
    assert.equal(result.total, 430000);
    assert.equal(result.net, 430000);
    assert.equal(result.due, true);
    assert.equal(result.zakat, 10750);
    assert.deepEqual(result.items.map((item) => item.value), [300000, 80000, 0, 50000]);
});

test("values silver by weight and price", () => {
    const result = calculateZakat({ ...empty, goldPrice: 100, silverGrams: 1000, silverPrice: 10 });
    assert.equal(result.items[2].value, 10000);
    assert.equal(result.zakat, 250);
});

test("no zakat below the nisab", () => {
    const result = calculateZakat({ ...empty, goldPrice: 4000, cash: 1000 });
    assert.equal(result.due, false);
    assert.equal(result.zakat, 0);
    assert.equal(result.shortBy, 339000);
});

test("exactly at the nisab is due", () => {
    const result = calculateZakat({ ...empty, goldPrice: 1000, cash: 85000 });
    assert.equal(result.due, true);
    assert.equal(result.zakat, 2125);
});

test("debts are subtracted but never below zero", () => {
    const withDebt = calculateZakat({ ...empty, goldPrice: 4000, cash: 400000, debts: 20000 });
    assert.equal(withDebt.net, 380000);
    assert.equal(withDebt.zakat, 9500);

    const drowning = calculateZakat({ ...empty, goldPrice: 4000, cash: 1000, debts: 5000 });
    assert.equal(drowning.debts, 1000);
    assert.equal(drowning.net, 0);
    assert.equal(drowning.due, false);
});

test("nothing owned means nothing due", () => {
    const result = calculateZakat({ ...empty, goldPrice: 0.001 });
    assert.equal(result.due, false);
});

test("rounds to cents", () => {
    assert.equal(roundMoney(0.1 + 0.2), 0.3);
    const result = calculateZakat({ ...empty, goldPrice: 1, cash: 1234.57 });
    assert.equal(result.zakat, 30.86);
});

test("formats money with Intl", () => {
    const space = (text) => text.replace(/ /g, " ");
    assert.equal(space(formatMoney(10750, "EGP")), "EGP 10,750.00");
    assert.equal(space(formatMoney(1.5, "KWD")), "KWD 1.500");
    assert.match(formatMoney(1234.5, "SAR", "ar-SA"), /١٬٢٣٤٫٥٠/);
});
