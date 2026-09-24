const { RATES_URL, CURRENCIES, parseRates, rateBetween, convert, formatMoney, formatRate } = CurrencyLogic;

const form = document.getElementById("converter");
const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const converted = document.getElementById("converted");
const rateLine = document.getElementById("rate");

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
}

async function loadRates() {
    converted.textContent = "Loading rates...";
    const response = await fetch(RATES_URL);
    data = parseRates(await response.json());
    render();
}

form.addEventListener("input", render);
form.addEventListener("submit", (event) => event.preventDefault());

fillSelects();
loadRates();
