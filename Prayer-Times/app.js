const {
    PRAYERS,
    buildUrl,
    parseResponse,
    secondsOfDay,
    findNextPrayer,
    formatCountdown,
    translate
} = PrayerLogic;

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

let lang = "en";
let current = null;
let currentQuery = null;
let timer = null;

function t(key, vars) {
    return translate(lang, key, vars);
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

async function loadTimes(query) {
    dateLine.textContent = t("loading");
    try {
        const response = await fetch(buildUrl({ ...query, date: new Date() }));
        const json = await response.json();
        renderTimes(parseResponse(json), query);
    } catch (error) {
        dateLine.textContent = t("loadFailed");
        timesList.replaceChildren();
        current = null;
        updateCountdown();
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    loadTimes({
        city: cityInput.value.trim(),
        country: countryInput.value.trim(),
        method: methodSelect.value
    });
});

for (const button of langButtons) {
    button.addEventListener("click", () => {
        lang = button.dataset.lang;
        applyLanguage();
    });
}
