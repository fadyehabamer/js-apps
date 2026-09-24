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

    const DAY_SECONDS = 24 * 60 * 60;
    const COUNTDOWN_PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

    function toSeconds(time) {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 3600 + minutes * 60;
    }

    function secondsOfDay(date, timeZone) {
        const options = { hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23" };
        if (timeZone) {
            options.timeZone = timeZone;
        }
        const parts = {};
        for (const part of new Intl.DateTimeFormat("en-GB", options).formatToParts(date)) {
            parts[part.type] = Number(part.value);
        }
        return (parts.hour % 24) * 3600 + parts.minute * 60 + parts.second;
    }

    function findNextPrayer(timings, nowSeconds) {
        for (const name of COUNTDOWN_PRAYERS) {
            const at = toSeconds(timings[name]);
            if (at > nowSeconds) {
                return { name, secondsLeft: at - nowSeconds, tomorrow: false };
            }
        }
        return {
            name: "Fajr",
            secondsLeft: DAY_SECONDS - nowSeconds + toSeconds(timings.Fajr),
            tomorrow: true
        };
    }

    function formatCountdown(totalSeconds) {
        const safe = Math.max(0, Math.floor(totalSeconds));
        const hours = Math.floor(safe / 3600);
        const minutes = Math.floor((safe % 3600) / 60);
        const seconds = safe % 60;
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    const STRINGS = {
        en: {
            title: "Prayer Times",
            subtitle: "Today's prayer times for a city, from the Aladhan API.",
            city: "City",
            country: "Country",
            method: "Calculation method",
            submit: "Get times",
            results: "Times",
            language: "Language",
            loading: "Loading...",
            loadFailed: "Could not load prayer times.",
            missingCity: "Enter a city name.",
            missingCountry: "Enter a country name.",
            notFound: "Couldn't find that city. Check the spelling or try the country's English name.",
            offline: "You're offline. Connect to the internet to load new times.",
            network: "Couldn't reach the prayer times service. Try again in a moment.",
            timeout: "The request took too long. Try again.",
            service: "The prayer times service returned an error. Try again later.",
            cached: "Showing saved times from {date}.",
            next: "Next: {name} in",
            nextTomorrow: "Next: {name} (tomorrow) in",
            method5: "Egyptian General Authority of Survey",
            method4: "Umm al-Qura, Makkah",
            method8: "Gulf Region",
            method3: "Muslim World League",
            method2: "ISNA (North America)",
            method1: "University of Islamic Sciences, Karachi",
            Fajr: "Fajr",
            Sunrise: "Sunrise",
            Dhuhr: "Dhuhr",
            Asr: "Asr",
            Maghrib: "Maghrib",
            Isha: "Isha"
        },
        ar: {
            title: "مواقيت الصلاة",
            subtitle: "مواقيت الصلاة لليوم في أي مدينة، من خدمة Aladhan.",
            city: "المدينة",
            country: "الدولة",
            method: "طريقة الحساب",
            submit: "عرض المواقيت",
            results: "المواقيت",
            language: "اللغة",
            loading: "جارٍ التحميل...",
            loadFailed: "تعذّر تحميل مواقيت الصلاة.",
            missingCity: "اكتب اسم المدينة.",
            missingCountry: "اكتب اسم الدولة.",
            notFound: "لم نعثر على هذه المدينة. تأكد من الكتابة أو جرّب الاسم بالإنجليزية.",
            offline: "أنت غير متصل بالإنترنت. اتصل لتحميل مواقيت جديدة.",
            network: "تعذّر الوصول إلى خدمة المواقيت. حاول مرة أخرى بعد قليل.",
            timeout: "استغرق الطلب وقتًا طويلًا. حاول مرة أخرى.",
            service: "حدث خطأ في خدمة المواقيت. حاول لاحقًا.",
            cached: "تُعرض المواقيت المحفوظة بتاريخ {date}.",
            next: "الصلاة القادمة: {name} بعد",
            nextTomorrow: "الصلاة القادمة: {name} (غدًا) بعد",
            method5: "الهيئة المصرية العامة للمساحة",
            method4: "أم القرى، مكة المكرمة",
            method8: "منطقة الخليج",
            method3: "رابطة العالم الإسلامي",
            method2: "الجمعية الإسلامية لأمريكا الشمالية",
            method1: "جامعة العلوم الإسلامية، كراتشي",
            Fajr: "الفجر",
            Sunrise: "الشروق",
            Dhuhr: "الظهر",
            Asr: "العصر",
            Maghrib: "المغرب",
            Isha: "العشاء"
        }
    };

    function validateQuery(city, country) {
        if (!String(city || "").trim()) {
            return "missingCity";
        }
        if (!String(country || "").trim()) {
            return "missingCountry";
        }
        return "";
    }

    function classifyError(error, online) {
        if (online === false) {
            return "offline";
        }
        if (error && error.name === "AbortError") {
            return "timeout";
        }
        if (error && error.name === "TypeError") {
            return "network";
        }
        const message = String(error && error.message || "");
        if (/geocode|city|address/i.test(message)) {
            return "notFound";
        }
        return "service";
    }

    function serializeCache(query, result, savedAt) {
        return JSON.stringify({ query, result, savedAt: savedAt.toISOString() });
    }

    function readCache(raw) {
        if (!raw) {
            return null;
        }
        let data;
        try {
            data = JSON.parse(raw);
        } catch (error) {
            return null;
        }
        if (!data || !data.query || !data.result || !data.result.timings) {
            return null;
        }
        if (!PRAYERS.every((name) => cleanTime(data.result.timings[name]))) {
            return null;
        }
        const savedAt = new Date(data.savedAt);
        if (Number.isNaN(savedAt.getTime())) {
            return null;
        }
        return { query: data.query, result: data.result, savedAt };
    }

    function isSameDay(a, b) {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    function translate(lang, key, vars) {
        const table = STRINGS[lang] || STRINGS.en;
        const text = key in table ? table[key] : STRINGS.en[key] || key;
        return text.replace(/\{(\w+)\}/g, (match, name) => (vars && name in vars ? vars[name] : match));
    }

    return {
        API_BASE,
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
    };
});
