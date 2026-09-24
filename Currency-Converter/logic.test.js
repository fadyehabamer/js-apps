const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
    RATES_URL,
    CODES,
    parseRates,
    rateBetween,
    convert,
    formatMoney,
    formatRate,
    relativeTime,
    formatTimestamp,
    parseAmount,
    classifyError,
    serializeCache,
    readCache
} = require("./logic.js");

const sample = {
    result: "success",
    base_code: "USD",
    time_last_update_unix: 1790208152,
    time_next_update_unix: 1790295822,
    rates: { USD: 1, AED: 3.6725, EGP: 51.418308, EUR: 0.877372, SAR: 3.75, GBP: 0.75 }
};

test("uses the no-key open.er-api endpoint", () => {
    assert.equal(RATES_URL, "https://open.er-api.com/v6/latest/USD");
    assert.deepEqual(CODES, ["EGP", "SAR", "AED", "USD", "EUR"]);
});

test("keeps only the five currencies from the response", () => {
    const data = parseRates(sample);
    assert.deepEqual(Object.keys(data.rates).sort(), ["AED", "EGP", "EUR", "SAR", "USD"]);
    assert.equal(data.updatedAt, 1790208152000);
    assert.equal(data.base, "USD");
});

test("throws on API errors and missing rates", () => {
    assert.throws(() => parseRates({ result: "error", "error-type": "unsupported-code" }), /unsupported-code/);
    assert.throws(() => parseRates(null), /unexpected/);
    assert.throws(() => parseRates({ ...sample, rates: { ...sample.rates, SAR: 0 } }), /SAR/);
});

test("converts through the USD base", () => {
    const { rates } = parseRates(sample);
    assert.ok(Math.abs(convert(100, "USD", "EGP", rates) - 5141.8308) < 1e-9);
    assert.ok(Math.abs(convert(3.75, "SAR", "USD", rates) - 1) < 1e-12);
    assert.equal(convert(50, "EGP", "EGP", rates), 50);
    assert.ok(Math.abs(rateBetween("SAR", "AED", rates) - 0.979333) < 1e-6);
    const there = convert(1000, "EUR", "EGP", rates);
    assert.ok(Math.abs(convert(there, "EGP", "EUR", rates) - 1000) < 1e-9);
});

test("formats money and rates", () => {
    const space = (text) => text.replace(/ /g, " ");
    assert.equal(space(formatMoney(5141.8308, "EGP")), "EGP 5,141.83");
    assert.equal(space(formatMoney(0.5, "EUR")), "EUR 0.50");
    assert.equal(formatRate(51.418308), "51.4183");
    assert.equal(formatRate(1 / 51.418308), "0.0194483");
    assert.equal(formatRate(3.75), "3.75");
});

test("parses amounts like the input box expects", () => {
    assert.equal(parseAmount("1,250.75"), 1250.75);
    assert.equal(parseAmount("١٢٥٠٫٥"), 1250.5);
    assert.equal(parseAmount("0"), 0);
    assert.ok(Number.isNaN(parseAmount("")));
    assert.ok(Number.isNaN(parseAmount("-3")));
    assert.ok(Number.isNaN(parseAmount("12abc")));
    assert.ok(Number.isNaN(parseAmount("9".repeat(20))));
});

test("describes how old the rates are", () => {
    const now = Date.UTC(2026, 8, 24, 18, 0);
    assert.equal(relativeTime(now - 15 * 3600 * 1000, now), "15 hours ago");
    assert.equal(relativeTime(now - 25 * 60 * 1000, now), "25 minutes ago");
    assert.equal(relativeTime(now - 10 * 1000, now), "this minute");
    assert.equal(relativeTime(now - 26 * 3600 * 1000, now), "yesterday");
    assert.match(formatTimestamp(Date.UTC(2026, 8, 24, 12, 0)), /24 Sept? 2026/);
});

test("classifies fetch failures", () => {
    assert.match(classifyError(new TypeError("Failed to fetch"), false), /offline/);
    assert.match(classifyError(new TypeError("Failed to fetch"), true), /reach/);
    assert.match(classifyError(Object.assign(new Error("x"), { name: "AbortError" }), true), /too long/);
    assert.match(classifyError(new Error("HTTP 503"), true), /unexpected/);
});

test("round trips the cache and rejects bad data", () => {
    const data = parseRates(sample);
    const cached = readCache(serializeCache(data, 1790210000000));
    assert.deepEqual(cached.rates, data.rates);
    assert.equal(cached.savedAt, 1790210000000);
    assert.equal(readCache(null), null);
    assert.equal(readCache("garbage"), null);
    assert.equal(readCache(JSON.stringify({ rates: { USD: 1 } })), null);
});
