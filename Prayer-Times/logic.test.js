const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
    PRAYERS,
    formatApiDate,
    buildUrl,
    cleanTime,
    parseResponse,
    toSeconds,
    secondsOfDay,
    findNextPrayer,
    formatCountdown,
    STRINGS,
    translate,
    validateQuery,
    classifyError,
    serializeCache,
    readCache,
    isSameDay
} = require("./logic.js");

const sample = {
    code: 200,
    status: "OK",
    data: {
        timings: {
            Fajr: "05:18",
            Sunrise: "06:44",
            Dhuhr: "12:47",
            Asr: "16:15",
            Sunset: "18:49",
            Maghrib: "18:49",
            Isha: "20:07 (EEST)"
        },
        date: {
            readable: "24 Sep 2026",
            hijri: { day: "13", year: "1448", month: { en: "Rabīʿ al-thānī", ar: "رَبيع الثاني" } }
        },
        meta: { timezone: "Africa/Cairo" }
    }
};

test("builds the dated Aladhan URL with encoded params", () => {
    const url = buildUrl({ city: " New York ", country: "USA", method: 2, date: new Date(2026, 0, 5) });
    assert.equal(url, "https://api.aladhan.com/v1/timingsByCity/05-01-2026?city=New+York&country=USA&method=2");
    assert.equal(formatApiDate(new Date(2026, 8, 24)), "24-09-2026");
});

test("cleans time strings", () => {
    assert.equal(cleanTime("20:07 (EEST)"), "20:07");
    assert.equal(cleanTime("5:03"), "05:03");
    assert.equal(cleanTime("soon"), null);
});

test("parses a good response", () => {
    const result = parseResponse(sample);
    assert.deepEqual(Object.keys(result.timings), PRAYERS);
    assert.equal(result.timings.Isha, "20:07");
    assert.equal(result.timezone, "Africa/Cairo");
    assert.equal(result.hijri.monthAr, "رَبيع الثاني");
});

test("rejects error and malformed responses", () => {
    assert.throws(() => parseResponse({ code: 400, data: "Unable to geocode address: X" }), /geocode/);
    assert.throws(() => parseResponse(null), /Unexpected/);
    const broken = structuredClone(sample);
    delete broken.data.timings.Asr;
    assert.throws(() => parseResponse(broken), /Asr/);
});

test("finds the next prayer and skips sunrise", () => {
    const { timings } = parseResponse(sample);
    assert.deepEqual(findNextPrayer(timings, toSeconds("04:00")), { name: "Fajr", secondsLeft: 4680, tomorrow: false });
    assert.equal(findNextPrayer(timings, toSeconds("06:00")).name, "Dhuhr");
    assert.equal(findNextPrayer(timings, toSeconds("12:47")).name, "Asr");
    const late = findNextPrayer(timings, toSeconds("23:00"));
    assert.equal(late.name, "Fajr");
    assert.equal(late.tomorrow, true);
    assert.equal(late.secondsLeft, 3600 + toSeconds("05:18"));
});

test("reads the clock in the city's time zone", () => {
    const instant = new Date("2026-01-15T10:30:15Z");
    assert.equal(secondsOfDay(instant, "UTC"), 10 * 3600 + 30 * 60 + 15);
    assert.equal(secondsOfDay(instant, "Asia/Riyadh"), 13 * 3600 + 30 * 60 + 15);
    assert.equal(secondsOfDay(new Date("2026-01-15T00:00:05Z"), "UTC"), 5);
});

test("formats the countdown", () => {
    assert.equal(formatCountdown(0), "00:00:00");
    assert.equal(formatCountdown(3725), "01:02:05");
    assert.equal(formatCountdown(-4), "00:00:00");
});

test("has matching Arabic and English strings", () => {
    assert.deepEqual(Object.keys(STRINGS.ar).sort(), Object.keys(STRINGS.en).sort());
    assert.equal(translate("ar", "Maghrib"), "المغرب");
    assert.equal(translate("en", "next", { name: "Asr" }), "Next: Asr in");
    assert.equal(translate("fr", "Fajr"), "Fajr");
});

test("validates the query", () => {
    assert.equal(validateQuery("Cairo", "Egypt"), "");
    assert.equal(validateQuery("  ", "Egypt"), "missingCity");
    assert.equal(validateQuery("Cairo", ""), "missingCountry");
});

test("classifies errors", () => {
    assert.equal(classifyError(new TypeError("Failed to fetch"), false), "offline");
    assert.equal(classifyError(new TypeError("Failed to fetch"), true), "network");
    assert.equal(classifyError(Object.assign(new Error("aborted"), { name: "AbortError" }), true), "timeout");
    assert.equal(classifyError(new Error("Unable to geocode address: X"), true), "notFound");
    assert.equal(classifyError(new Error("HTTP 500"), true), "service");
});

test("round trips the cache and rejects junk", () => {
    const result = parseResponse(sample);
    const query = { city: "Cairo", country: "Egypt", method: "5" };
    const savedAt = new Date("2026-09-24T08:00:00Z");
    const cache = readCache(serializeCache(query, result, savedAt));
    assert.deepEqual(cache.query, query);
    assert.equal(cache.savedAt.getTime(), savedAt.getTime());
    assert.equal(readCache(null), null);
    assert.equal(readCache("{oops"), null);
    assert.equal(readCache(JSON.stringify({ query, result: { timings: {} }, savedAt })), null);
});

test("compares calendar days", () => {
    assert.equal(isSameDay(new Date(2026, 8, 24, 1), new Date(2026, 8, 24, 23)), true);
    assert.equal(isSameDay(new Date(2026, 8, 24), new Date(2026, 8, 25)), false);
});
