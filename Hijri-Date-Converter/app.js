const {
    todayUtc,
    toIsoDate,
    parseIsoDate,
    toHijriParts,
    hijriToGregorian,
    hijriMonthNames,
    validateHijri,
    validateGregorian,
    MIN_HIJRI_YEAR,
    MAX_HIJRI_YEAR,
    formatHijri,
    formatGregorian
} = HijriLogic;

const todayGregorian = document.getElementById("today-gregorian");
const todayHijriEn = document.getElementById("today-hijri-en");
const todayHijriAr = document.getElementById("today-hijri-ar");
const g2hForm = document.getElementById("g2h-form");
const gDateInput = document.getElementById("g-date");
const g2hResult = document.getElementById("g2h-result");
const h2gForm = document.getElementById("h2g-form");
const hDayInput = document.getElementById("h-day");
const hMonthSelect = document.getElementById("h-month");
const hYearInput = document.getElementById("h-year");
const h2gResult = document.getElementById("h2g-result");

function fillMonths() {
    const english = hijriMonthNames("en");
    const arabic = hijriMonthNames("ar");
    english.forEach((name, index) => {
        const option = document.createElement("option");
        option.value = String(index + 1);
        option.textContent = `${index + 1}. ${name} (${arabic[index]})`;
        hMonthSelect.appendChild(option);
    });
}

function showToday() {
    const today = todayUtc(new Date());
    todayGregorian.textContent = formatGregorian(today, "en");
    todayHijriEn.textContent = formatHijri(today, "en");
    todayHijriAr.textContent = formatHijri(today, "ar");
    gDateInput.value = toIsoDate(today);

    const hijri = toHijriParts(today);
    hDayInput.value = hijri.day;
    hMonthSelect.value = String(hijri.month);
    hYearInput.value = hijri.year;
}

function renderResult(container, lines) {
    container.replaceChildren();
    for (const line of lines) {
        const p = document.createElement("p");
        p.textContent = line.text;
        p.className = line.lang === "ar" ? "date-ar" : "date-en";
        if (line.lang === "ar") {
            p.lang = "ar";
            p.dir = "rtl";
        }
        container.appendChild(p);
    }
}

function showError(container, message, inputs) {
    container.replaceChildren();
    const p = document.createElement("p");
    p.className = "error";
    p.setAttribute("role", "alert");
    p.textContent = message;
    container.appendChild(p);
    inputs.forEach((input) => input.setAttribute("aria-invalid", "true"));
}

function clearInvalid(inputs) {
    inputs.forEach((input) => input.removeAttribute("aria-invalid"));
}

g2hForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const date = parseIsoDate(gDateInput.value);
    const error = validateGregorian(date);
    if (error) {
        showError(g2hResult, error, [gDateInput]);
        return;
    }
    clearInvalid([gDateInput]);
    renderResult(g2hResult, [
        { text: formatHijri(date, "en"), lang: "en" },
        { text: formatHijri(date, "ar"), lang: "ar" }
    ]);
});

h2gForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = [hDayInput, hMonthSelect, hYearInput];
    const year = hYearInput.value.trim() === "" ? NaN : Number(hYearInput.value);
    const month = Number(hMonthSelect.value);
    const day = hDayInput.value.trim() === "" ? NaN : Number(hDayInput.value);
    const error = validateHijri(year, month, day);
    if (error) {
        showError(h2gResult, error, fields);
        return;
    }
    clearInvalid(fields);
    const date = hijriToGregorian(year, month, day);
    renderResult(h2gResult, [
        { text: formatGregorian(date, "en"), lang: "en" },
        { text: formatGregorian(date, "ar"), lang: "ar" }
    ]);
});

hYearInput.min = String(MIN_HIJRI_YEAR);
hYearInput.max = String(MAX_HIJRI_YEAR);
fillMonths();
showToday();
