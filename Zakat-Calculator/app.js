const { calculateZakat, formatMoney, CURRENCIES, NISAB_GOLD_GRAMS } = ZakatLogic;

const form = document.getElementById("zakat-form");
const summary = document.getElementById("summary");
const currencySelect = document.getElementById("currency");
const breakdown = document.getElementById("breakdown");
const breakdownBody = document.getElementById("breakdown-body");
const breakdownFoot = document.getElementById("breakdown-foot");

function fillCurrencies() {
    for (const code of CURRENCIES) {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = code;
        currencySelect.appendChild(option);
    }
}

function readNumber(id) {
    const value = Number(document.getElementById(id).value);
    return Number.isFinite(value) ? value : 0;
}

function row(label, value, className) {
    const tr = document.createElement("tr");
    if (className) {
        tr.className = className;
    }
    const th = document.createElement("th");
    th.scope = "row";
    th.textContent = label;
    const td = document.createElement("td");
    td.className = "num";
    td.textContent = value;
    tr.append(th, td);
    return tr;
}

function renderResult(result, currency) {
    const money = (value) => formatMoney(value, currency);
    breakdownBody.replaceChildren(...result.items.map((item) => row(item.label, money(item.value))));
    breakdownFoot.replaceChildren(
        row("Total zakatable wealth", money(result.total), "total"),
        row(`Nisab (${NISAB_GOLD_GRAMS} g of gold)`, money(result.nisab)),
        row("Zakat due (2.5%)", money(result.zakat), "zakat")
    );
    breakdown.hidden = false;
    if (result.due) {
        summary.textContent = `Your wealth is above the nisab. Zakat due: ${money(result.zakat)}.`;
    } else {
        summary.textContent = `Your wealth is ${money(result.shortBy)} below the nisab, so no zakat is due.`;
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = calculateZakat({
        goldPrice: readNumber("gold-price"),
        cash: readNumber("cash"),
        goldGrams: readNumber("gold-grams"),
        silverGrams: readNumber("silver-grams"),
        silverPrice: readNumber("silver-price"),
        tradeGoods: readNumber("trade-goods")
    });
    renderResult(result, currencySelect.value);
});

fillCurrencies();
