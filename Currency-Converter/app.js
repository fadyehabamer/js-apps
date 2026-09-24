const {
    RATES_URL,
    CURRENCIES,
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
} = CurrencyLogic;

const CACHE_KEY = "currency-converter:rates";
const PREFS_KEY = "currency-converter:prefs";
const REQUEST_TIMEOUT_MS = 10000;

const form = document.getElementById("converter");
const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const converted = document.getElementById("converted");
const rateLine = document.getElementById("rate");
const swapButton = document.getElementById("swap");
const othersList = document.getElementById("others");
const updatedLine = document.getElementById("updated");
const refreshButton = document.getElementById("refresh");
const amountError = document.getElementById("amount-error");
const statusLine = document.getElementById("status");

let data = null;

function storageGet(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        return null;
    }
}

function storageSet(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        return;
    }
}

function setStatus(message, kind) {
    statusLine.hidden = !message;
    statusLine.textContent = message;
    statusLine.className = kind ? `status ${kind}` : "status";
}

function restorePrefs() {
    try {
        const prefs = JSON.parse(storageGet(PREFS_KEY) || "null");
        if (prefs && CODES.includes(prefs.from) && CODES.includes(prefs.to)) {
            fromSelect.value = prefs.from;
            toSelect.value = prefs.to;
        }
        if (prefs && typeof prefs.amount === "string" && prefs.amount.length < 30) {
            amountInput.value = prefs.amount;
        }
    } catch (error) {
        return;
    }
}

function savePrefs() {
    storageSet(PREFS_KEY, JSON.stringify({ from: fromSelect.value, to: toSelect.value, amount: amountInput.value }));
}

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
    const empty = amountInput.value.trim() === "";
    const amount = parseAmount(amountInput.value);
    if (Number.isNaN(amount)) {
        if (empty) {
            amountInput.removeAttribute("aria-invalid");
            amountError.textContent = "";
        } else {
            amountInput.setAttribute("aria-invalid", "true");
            amountError.textContent = "Enter an amount like 250 or 1,250.75.";
        }
        converted.textContent = "";
        rateLine.textContent = "";
        othersList.replaceChildren();
        renderUpdated();
        return;
    }
    amountInput.removeAttribute("aria-invalid");
    amountError.textContent = "";
    const from = fromSelect.value;
    const to = toSelect.value;
    converted.textContent = `${formatMoney(amount, from)} = ${formatMoney(convert(amount, from, to, data.rates), to)}`;
    rateLine.textContent = `1 ${from} = ${formatRate(rateBetween(from, to, data.rates))} ${to}`;
    renderOthers(amount, from, to);
    renderUpdated();
}

function renderUpdated() {
    if (!data || !data.updatedAt) {
        updatedLine.textContent = "";
        return;
    }
    const time = document.createElement("time");
    time.dateTime = new Date(data.updatedAt).toISOString();
    time.textContent = formatTimestamp(data.updatedAt);
    updatedLine.replaceChildren("Rates updated ", time, ` (${relativeTime(data.updatedAt, Date.now())})`);
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

async function fetchRates() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        const response = await fetch(RATES_URL, { signal: controller.signal });
        let json;
        try {
            json = await response.json();
        } catch (error) {
            throw new Error(`HTTP ${response.status}`);
        }
        return parseRates(json);
    } finally {
        clearTimeout(timeout);
    }
}

async function loadRates() {
    if (!data) {
        converted.textContent = "Loading rates...";
    }
    refreshButton.disabled = true;
    try {
        data = await fetchRates();
        storageSet(CACHE_KEY, serializeCache(data, Date.now()));
        setStatus("", "");
    } catch (error) {
        const reason = classifyError(error, navigator.onLine);
        if (data) {
            setStatus(`${reason} Showing the last rates we have, so they may be out of date.`, "warn");
        } else {
            converted.textContent = "Rates unavailable";
            rateLine.textContent = "";
            setStatus(`${reason} Check your connection and press Refresh rates to try again.`, "error");
        }
    } finally {
        refreshButton.disabled = false;
        render();
    }
}

form.addEventListener("input", () => {
    render();
    savePrefs();
});

swapButton.addEventListener("click", () => {
    const from = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = from;
    render();
    savePrefs();
});
form.addEventListener("submit", (event) => event.preventDefault());

refreshButton.addEventListener("click", loadRates);

fillSelects();
restorePrefs();
data = readCache(storageGet(CACHE_KEY));
render();
loadRates();
setInterval(renderUpdated, 60000);
