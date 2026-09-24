const { todayUtc, formatHijri, formatGregorian } = HijriLogic;

const todayGregorian = document.getElementById("today-gregorian");
const todayHijriEn = document.getElementById("today-hijri-en");
const todayHijriAr = document.getElementById("today-hijri-ar");

function showToday() {
    const today = todayUtc(new Date());
    todayGregorian.textContent = formatGregorian(today, "en");
    todayHijriEn.textContent = formatHijri(today, "en");
    todayHijriAr.textContent = formatHijri(today, "ar");
}

showToday();
