const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
    toUtcDate,
    todayUtc,
    toHijriParts,
    formatHijri,
    formatGregorian,
    parseIsoDate,
    toIsoDate,
    hijriToGregorian,
    hijriMonthNames,
    daysInHijriMonth,
    validateHijri,
    validateGregorian
} = require("./logic.js");

test("converts known Gregorian dates to Umm al-Qura", () => {
    assert.deepEqual(toHijriParts(toUtcDate(2024, 7, 7)), { year: 1446, month: 1, day: 1 });
    assert.deepEqual(toHijriParts(toUtcDate(2026, 2, 18)), { year: 1447, month: 9, day: 1 });
    assert.deepEqual(toHijriParts(toUtcDate(2026, 9, 24)), { year: 1448, month: 4, day: 13 });
});

test("converts Hijri dates back to Gregorian", () => {
    assert.equal(toIsoDate(hijriToGregorian(1446, 1, 1)), "2024-07-07");
    assert.equal(toIsoDate(hijriToGregorian(1447, 9, 1)), "2026-02-18");
    assert.equal(toIsoDate(hijriToGregorian(1356, 1, 1)), "1937-03-14");
});

test("round trips every day of a year", () => {
    for (let day = 0; day < 366; day++) {
        const date = new Date(Date.UTC(2025, 0, 1 + day));
        const parts = toHijriParts(date);
        assert.equal(hijriToGregorian(parts.year, parts.month, parts.day).getTime(), date.getTime());
    }
});

test("returns null for a day that does not exist", () => {
    assert.equal(hijriToGregorian(1448, 3, 30), null);
    assert.equal(daysInHijriMonth(1448, 3), 29);
    assert.equal(daysInHijriMonth(1448, 4), 30);
});

test("formats in English and Arabic", () => {
    const date = toUtcDate(2024, 7, 7);
    assert.match(formatHijri(date, "en"), /Sunday,? Muharram 1,? 1446 AH/);
    assert.match(formatHijri(date, "ar"), /محرم/);
    assert.match(formatHijri(date, "ar"), /١٤٤٦/);
    assert.match(formatGregorian(date, "en"), /Sunday,? 7 July 2024/);
    assert.match(formatGregorian(date, "ar"), /يوليو/);
});

test("parses ISO dates strictly", () => {
    assert.equal(toIsoDate(parseIsoDate("2026-09-24")), "2026-09-24");
    assert.equal(parseIsoDate("2026-02-30"), null);
    assert.equal(parseIsoDate("24/09/2026"), null);
    assert.equal(parseIsoDate(""), null);
});

test("todayUtc keeps the local calendar day", () => {
    const now = new Date(2026, 8, 24, 23, 30);
    assert.equal(toIsoDate(todayUtc(now)), "2026-09-24");
});

test("month names come from Intl", () => {
    const en = hijriMonthNames("en");
    const ar = hijriMonthNames("ar");
    assert.equal(en.length, 12);
    assert.equal(en[8], "Ramadan");
    assert.equal(ar[8], "رمضان");
});

test("validates Hijri input", () => {
    assert.equal(validateHijri(1448, 4, 13), "");
    assert.match(validateHijri(NaN, 4, 13), /whole number/);
    assert.match(validateHijri(1448, 4, 1.5), /whole number/);
    assert.match(validateHijri(1200, 1, 1), /between 1300 and 1600/);
    assert.match(validateHijri(1448, 13, 1), /Month/);
    assert.match(validateHijri(1448, 3, 30), /29 days/);
    assert.match(validateHijri(1448, 3, 0), /29 days/);
});

test("validates Gregorian input", () => {
    assert.equal(validateGregorian(toUtcDate(2026, 9, 24)), "");
    assert.match(validateGregorian(null), /valid date/);
    assert.match(validateGregorian(toUtcDate(1700, 1, 1)), /outside/);
});
