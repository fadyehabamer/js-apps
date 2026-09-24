(function (root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    } else {
        root.HijriLogic = api;
    }
})(typeof self !== "undefined" ? self : this, function () {
    const HIJRI_LOCALES = {
        en: "en-u-ca-islamic-umalqura-nu-latn",
        ar: "ar-SA-u-ca-islamic-umalqura-nu-arab"
    };

    const GREGORIAN_LOCALES = {
        en: "en-GB-u-ca-gregory-nu-latn",
        ar: "ar-EG-u-ca-gregory-nu-arab"
    };

    const numericHijri = new Intl.DateTimeFormat(HIJRI_LOCALES.en, {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        timeZone: "UTC"
    });

    function toUtcDate(year, month, day) {
        const date = new Date(Date.UTC(2000, month - 1, day));
        date.setUTCFullYear(year);
        return date;
    }

    function todayUtc(now) {
        return toUtcDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }

    function toHijriParts(date) {
        const parts = {};
        for (const part of numericHijri.formatToParts(date)) {
            if (part.type === "year" || part.type === "month" || part.type === "day") {
                parts[part.type] = Number(part.value);
            }
        }
        return parts;
    }

    function formatHijri(date, lang) {
        return new Intl.DateTimeFormat(HIJRI_LOCALES[lang], {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC"
        }).format(date);
    }

    function formatGregorian(date, lang) {
        return new Intl.DateTimeFormat(GREGORIAN_LOCALES[lang], {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC"
        }).format(date);
    }

    function parseIsoDate(value) {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
        if (!match) {
            return null;
        }
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        const date = toUtcDate(year, month, day);
        if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
            return null;
        }
        return date;
    }

    function toIsoDate(date) {
        return date.toISOString().slice(0, 10);
    }

    const HIJRI_EPOCH = toUtcDate(622, 7, 19);
    const DAY_MS = 24 * 60 * 60 * 1000;
    const MEAN_YEAR_DAYS = 354.36667;
    const MEAN_MONTH_DAYS = 29.530589;

    function estimateGregorian(year, month, day) {
        const days = (year - 1) * MEAN_YEAR_DAYS + (month - 1) * MEAN_MONTH_DAYS + (day - 1);
        return new Date(HIJRI_EPOCH.getTime() + Math.round(days) * DAY_MS);
    }

    function hijriToGregorian(year, month, day) {
        const guess = estimateGregorian(year, month, day);
        for (let offset = -5; offset <= 5; offset++) {
            const candidate = new Date(guess.getTime() + offset * DAY_MS);
            const parts = toHijriParts(candidate);
            if (parts.year === year && parts.month === month && parts.day === day) {
                return candidate;
            }
        }
        return null;
    }

    function hijriMonthNames(lang) {
        const formatter = new Intl.DateTimeFormat(HIJRI_LOCALES[lang], { month: "long", timeZone: "UTC" });
        const names = [];
        for (let month = 1; month <= 12; month++) {
            names.push(formatter.format(hijriToGregorian(1447, month, 1)));
        }
        return names;
    }

    return {
        toUtcDate,
        todayUtc,
        toHijriParts,
        formatHijri,
        formatGregorian,
        parseIsoDate,
        toIsoDate,
        hijriToGregorian,
        hijriMonthNames
    };
});
