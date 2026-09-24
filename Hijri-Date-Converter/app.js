const { todayUtc, toIsoDate, parseIsoDate, formatHijri, formatGregorian } = HijriLogic;

const todayGregorian = document.getElementById("today-gregorian");
const todayHijriEn = document.getElementById("today-hijri-en");
const todayHijriAr = document.getElementById("today-hijri-ar");
const g2hForm = document.getElementById("g2h-form");
const gDateInput = document.getElementById("g-date");
const g2hResult = document.getElementById("g2h-result");

function showToday() {
    const today = todayUtc(new Date());
    todayGregorian.textContent = formatGregorian(today, "en");
    todayHijriEn.textContent = formatHijri(today, "en");
    todayHijriAr.textContent = formatHijri(today, "ar");
    gDateInput.value = toIsoDate(today);
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

g2hForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const date = parseIsoDate(gDateInput.value);
    if (!date) {
        return;
    }
    renderResult(g2hResult, [
        { text: formatHijri(date, "en"), lang: "en" },
        { text: formatHijri(date, "ar"), lang: "ar" }
    ]);
});

showToday();
