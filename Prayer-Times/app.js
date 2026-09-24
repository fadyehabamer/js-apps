const {
    PRAYERS,
    buildUrl,
    parseResponse,
    secondsOfDay,
    findNextPrayer,
    formatCountdown,
    translate,
    validateQuery,
    classifyError,
    serializeCache,
    readCache,
    isSameDay
} = PrayerLogic;

const REQUEST_TIMEOUT_MS = 10000;
const CACHE_KEY = "prayer-times:last";
const LANG_KEY = "prayer-times:lang";

const form = document.getElementById("city-form");
const cityInput = document.getElementById("city");
const countryInput = document.getElementById("country");
const methodSelect = document.getElementById("method");
const dateLine = document.getElementById("date-line");
const timesList = document.getElementById("times-list");
const nextBox = document.getElementById("next-box");
const nextLabel = document.getElementById("next-label");
const countdown = document.getElementById("countdown");
const langButtons = document.querySelectorAll(".lang-btn");
const statusLine = document.getElementById("status");
const resultsSection = document.getElementById("results");
const submitButton = document.getElementById("submit-btn");
const cacheNote = document.getElementById("cache-note");

let lang = "en";
let current = null;
let currentQuery = null;
let timer = null;
let statusKey = "";
let statusIsError = false;
let cachedAt = null;

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
        return false;
    }
    return true;
}

function t(key, vars) {
    return translate(lang, key, vars);
}

function setStatus(key, isError) {
    statusKey = key;
    statusIsError = Boolean(isError);
    statusLine.textContent = key ? t(key) : "";
    statusLine.classList.toggle("error", statusIsError);
}

function applyLanguage() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = t("title");
    for (const element of document.querySelectorAll("[data-i18n]")) {
        element.textContent = t(element.dataset.i18n);
    }
    for (const button of langButtons) {
        button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
    }
    if (current) {
        renderTimes(current, currentQuery);
    }
    setStatus(statusKey, statusIsError);
    updateCacheNote();
}

function describeDate(result) {
    if (lang === "ar" && result.hijri) {
        return `${result.hijri.day} ${result.hijri.monthAr} ${result.hijri.year}`;
    }
    if (result.hijri) {
        return `${result.gregorian} · ${result.hijri.day} ${result.hijri.monthEn} ${result.hijri.year}`;
    }
    return result.gregorian;
}

function updateCountdown() {
    if (!current) {
        nextBox.hidden = true;
        return;
    }
    const now = secondsOfDay(new Date(), current.timezone);
    const next = findNextPrayer(current.timings, now);
    nextBox.hidden = false;
    nextLabel.textContent = t(next.tomorrow ? "nextTomorrow" : "next", { name: t(next.name) });
    countdown.textContent = formatCountdown(next.secondsLeft);
    for (const item of timesList.children) {
        item.classList.toggle("next", item.dataset.prayer === next.name && !next.tomorrow);
    }
}

function startCountdown() {
    clearInterval(timer);
    updateCountdown();
    timer = setInterval(updateCountdown, 1000);
}

function renderTimes(result, query) {
    current = result;
    currentQuery = query;
    resultsSection.hidden = false;
    dateLine.textContent = `${query.city}, ${query.country} · ${describeDate(result)}`;
    timesList.replaceChildren();
    for (const name of PRAYERS) {
        const item = document.createElement("li");
        item.dataset.prayer = name;
        const label = document.createElement("span");
        label.textContent = t(name);
        const time = document.createElement("span");
        time.className = "time";
        time.dir = "ltr";
        time.textContent = result.timings[name];
        item.append(label, time);
        timesList.appendChild(item);
    }
    startCountdown();
}

async function fetchJson(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        const response = await fetch(url, { signal: controller.signal });
        let json;
        try {
            json = await response.json();
        } catch (error) {
            throw new Error(`HTTP ${response.status}`);
        }
        return json;
    } finally {
        clearTimeout(timeout);
    }
}

function formatSavedDate(date) {
    return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium" }).format(date);
}

function updateCacheNote() {
    cacheNote.hidden = !cachedAt;
    cacheNote.textContent = cachedAt ? t("cached", { date: formatSavedDate(cachedAt) }) : "";
}

function restoreCache() {
    const cache = readCache(storageGet(CACHE_KEY));
    if (!cache) {
        return null;
    }
    cityInput.value = cache.query.city;
    countryInput.value = cache.query.country;
    methodSelect.value = cache.query.method;
    cachedAt = isSameDay(cache.savedAt, new Date()) ? null : cache.savedAt;
    renderTimes(cache.result, cache.query);
    updateCacheNote();
    return cache;
}

async function loadTimes(query) {
    if (navigator.onLine === false) {
        setStatus("offline", true);
        return;
    }
    setStatus("loading", false);
    submitButton.disabled = true;
    try {
        const json = await fetchJson(buildUrl({ ...query, date: new Date() }));
        const result = parseResponse(json);
        cachedAt = null;
        renderTimes(result, query);
        updateCacheNote();
        setStatus("", false);
        storageSet(CACHE_KEY, serializeCache(query, result, new Date()));
    } catch (error) {
        setStatus(classifyError(error, navigator.onLine), true);
    } finally {
        submitButton.disabled = false;
    }
}

function markInvalid(input, invalid) {
    if (invalid) {
        input.setAttribute("aria-invalid", "true");
    } else {
        input.removeAttribute("aria-invalid");
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = {
        city: cityInput.value.trim(),
        country: countryInput.value.trim(),
        method: methodSelect.value
    };
    const problem = validateQuery(query.city, query.country);
    markInvalid(cityInput, problem === "missingCity");
    markInvalid(countryInput, problem === "missingCountry");
    if (problem) {
        setStatus(problem, true);
        (problem === "missingCity" ? cityInput : countryInput).focus();
        return;
    }
    loadTimes(query);
});

window.addEventListener("offline", () => setStatus("offline", true));
window.addEventListener("online", () => {
    if (statusKey === "offline") {
        if (cachedAt) {
            loadTimes(currentQuery);
        } else {
            setStatus("", false);
        }
    }
});

for (const button of langButtons) {
    button.addEventListener("click", () => {
        lang = button.dataset.lang;
        storageSet(LANG_KEY, lang);
        applyLanguage();
    });
}

function start() {
    const savedLang = storageGet(LANG_KEY);
    if (savedLang === "ar" || savedLang === "en") {
        lang = savedLang;
    }
    applyLanguage();
    const cache = restoreCache();
    if (!cache || !cachedAt) {
        return;
    }
    if (navigator.onLine === false) {
        setStatus("offline", true);
    } else {
        loadTimes(cache.query);
    }
}

start();
