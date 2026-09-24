(function (root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    } else {
        root.PrayerLogic = api;
    }
})(typeof self !== "undefined" ? self : this, function () {
    const API_BASE = "https://api.aladhan.com/v1/timingsByCity";
    const PRAYERS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

    function pad(value) {
        return String(value).padStart(2, "0");
    }

    function formatApiDate(date) {
        return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
    }

    function buildUrl({ city, country, method, date }) {
        const params = new URLSearchParams({
            city: city.trim(),
            country: country.trim(),
            method: String(method)
        });
        return `${API_BASE}/${formatApiDate(date)}?${params}`;
    }

    function cleanTime(value) {
        const match = /(\d{1,2}):(\d{2})/.exec(String(value));
        if (!match) {
            return null;
        }
        return `${pad(match[1])}:${match[2]}`;
    }

    function parseResponse(json) {
        if (!json || json.code !== 200 || !json.data || !json.data.timings) {
            const reason = json && typeof json.data === "string" ? json.data : "Unexpected response from the prayer times service.";
            throw new Error(reason);
        }
        const timings = {};
        for (const name of PRAYERS) {
            const time = cleanTime(json.data.timings[name]);
            if (!time) {
                throw new Error(`Missing time for ${name}.`);
            }
            timings[name] = time;
        }
        const date = json.data.date || {};
        const meta = json.data.meta || {};
        return {
            timings,
            timezone: meta.timezone || "",
            gregorian: date.readable || "",
            hijri: date.hijri ? {
                day: date.hijri.day,
                year: date.hijri.year,
                monthEn: date.hijri.month && date.hijri.month.en,
                monthAr: date.hijri.month && date.hijri.month.ar
            } : null
        };
    }

    return {
        API_BASE,
        PRAYERS,
        formatApiDate,
        buildUrl,
        cleanTime,
        parseResponse
    };
});
