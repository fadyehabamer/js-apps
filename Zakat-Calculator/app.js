const { calculateZakat, validateInputs, formatMoney, CURRENCIES, NISAB_GOLD_GRAMS } = ZakatLogic;

const form = document.getElementById("zakat-form");
const summary = document.getElementById("summary");
const currencySelect = document.getElementById("currency");
const breakdown = document.getElementById("breakdown");
const breakdownBody = document.getElementById("breakdown-body");
const breakdownFoot = document.getElementById("breakdown-foot");
const inputs = Array.from(form.querySelectorAll("input[data-field]"));

function fillCurrencies() {
    for (const code of CURRENCIES) {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = code;
        currencySelect.appendChild(option);
    }
}

function readForm() {
    const raw = {};
    for (const input of inputs) {
        raw[input.dataset.field] = input.value;
    }
    return raw;
}

function showErrors(errors) {
    for (const input of inputs) {
        const message = errors[input.dataset.field] || "";
        document.getElementById(`${input.id}-error`).textContent = message;
        if (message) {
            input.setAttribute("aria-invalid", "true");
        } else {
            input.removeAttribute("aria-invalid");
        }
    }
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
    const { values, errors, valid } = validateInputs(readForm());
    showErrors(errors);
    if (!valid) {
        breakdown.hidden = true;
        const count = Object.keys(errors).length;
        summary.textContent = count === 1 ? "One field needs fixing before calculating." : `${count} fields need fixing before calculating.`;
        inputs.find((input) => input.hasAttribute("aria-invalid")).focus();
        return;
    }
    renderResult(calculateZakat(values), currencySelect.value);
});

fillCurrencies();
