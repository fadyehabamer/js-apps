const { RATES_URL, CURRENCIES, CODES, parseRates, rateBetween, convert, formatMoney, formatRate } = CurrencyLogic;

const form = document.getElementById("converter");
const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const converted = document.getElementById("converted");
const rateLine = document.getElementById("rate");
const swapButton = document.getElementById("swap");
const othersList = document.getElementById("others");

let data = null;

function fillSelects() {
    for (const select of [fromSelect, toSelect]) {
        for (const currency of CURRENCIES) {
            const option = document.createElement("option");
            option.value = currency.code;
            option.textContent = `${currency.code} - ${currency.name}`;
            select.appendChild(option);
        }
    }
    fromSelect.value = "USD";
    toSelect.value = "EGP";
}

function render() {
    if (!data) {
        return;
    }
    const amount = Number(amountInput.value);
    const from = fromSelect.value;
    const to = toSelect.value;
    converted.textContent = `${formatMoney(amount, from)} = ${formatMoney(convert(amount, from, to, data.rates), to)}`;
    rateLine.textContent = `1 ${from} = ${formatRate(rateBetween(from, to, data.rates))} ${to}`;
    renderOthers(amount, from, to);
}

function renderOthers(amount, from, to) {
    othersList.replaceChildren();
    for (const code of CODES) {
        if (code === from || code === to) {
            continue;
        }
        const item = document.createElement("li");
        const label = document.createElement("span");
        label.textContent = CURRENCIES.find((currency) => currency.code === code).name;
        const value = document.createElement("strong");
        value.textContent = formatMoney(convert(amount, from, code, data.rates), code);
        item.append(label, value);
        othersList.appendChild(item);
    }
}

async function loadRates() {
    converted.textContent = "Loading rates...";
    const response = await fetch(RATES_URL);
    data = parseRates(await response.json());
    render();
}

form.addEventListener("input", render);

swapButton.addEventListener("click", () => {
    const from = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = from;
    render();
});
form.addEventListener("submit", (event) => event.preventDefault());

fillSelects();
loadRates();
