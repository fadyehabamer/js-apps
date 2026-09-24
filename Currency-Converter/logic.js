(function (root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    } else {
        root.CurrencyLogic = api;
    }
})(typeof self !== "undefined" ? self : this, function () {
    const RATES_URL = "https://open.er-api.com/v6/latest/USD";

    const CURRENCIES = [
        { code: "EGP", name: "Egyptian pound" },
        { code: "SAR", name: "Saudi riyal" },
        { code: "AED", name: "UAE dirham" },
        { code: "USD", name: "US dollar" },
        { code: "EUR", name: "Euro" }
    ];

    const CODES = CURRENCIES.map((currency) => currency.code);

    function parseRates(json) {
        if (!json || json.result !== "success" || !json.rates) {
            const reason = json && json["error-type"] ? json["error-type"] : "unexpected response";
            throw new Error(`Rates service error: ${reason}`);
        }
        const rates = {};
        for (const code of CODES) {
            const rate = Number(json.rates[code]);
            if (!(rate > 0)) {
                throw new Error(`Missing rate for ${code}`);
            }
            rates[code] = rate;
        }
        return {
            base: json.base_code,
            rates,
            updatedAt: Number(json.time_last_update_unix) * 1000,
            nextUpdateAt: Number(json.time_next_update_unix) * 1000
        };
    }

    function rateBetween(from, to, rates) {
        return rates[to] / rates[from];
    }

    function convert(amount, from, to, rates) {
        return amount * rateBetween(from, to, rates);
    }

    function formatMoney(value, currency, locale) {
        return new Intl.NumberFormat(locale || "en", {
            style: "currency",
            currency,
            currencyDisplay: "code"
        }).format(value);
    }

    function formatRate(value, locale) {
        return new Intl.NumberFormat(locale || "en", {
            maximumSignificantDigits: 6
        }).format(value);
    }

    function relativeTime(then, now, locale) {
        const formatter = new Intl.RelativeTimeFormat(locale || "en", { numeric: "auto" });
        const seconds = Math.round((then - now) / 1000);
        const units = [
            ["day", 86400],
            ["hour", 3600],
            ["minute", 60]
        ];
        for (const [unit, size] of units) {
            if (Math.abs(seconds) >= size) {
                return formatter.format(Math.round(seconds / size), unit);
            }
        }
        return formatter.format(0, "minute");
    }

    function formatTimestamp(ms, locale) {
        return new Intl.DateTimeFormat(locale || "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(ms));
    }

    function parseAmount(raw) {
        const text = String(raw == null ? "" : raw)
            .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
            .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 0x06F0))
            .replace(/\u066B/g, ".")
            .replace(/[\s,\u066C_]/g, "");
        if (!/^(\d+\.?\d*|\.\d+)$/.test(text)) {
            return NaN;
        }
        const value = Number(text);
        return value <= 1e15 ? value : NaN;
    }

    function classifyError(error, online) {
        if (online === false) {
            return "You're offline.";
        }
        if (error && error.name === "AbortError") {
            return "The rates service took too long to answer.";
        }
        if (error && error.name === "TypeError") {
            return "Couldn't reach the rates service.";
        }
        return "The rates service sent back something unexpected.";
    }

    function serializeCache(data, savedAt) {
        return JSON.stringify({ ...data, savedAt });
    }

    function readCache(raw) {
        if (!raw) {
            return null;
        }
        try {
            const cached = JSON.parse(raw);
            if (!cached || !cached.rates || !CODES.every((code) => Number(cached.rates[code]) > 0)) {
                return null;
            }
            return {
                base: cached.base,
                rates: cached.rates,
                updatedAt: Number(cached.updatedAt) || 0,
                nextUpdateAt: Number(cached.nextUpdateAt) || 0,
                savedAt: Number(cached.savedAt) || 0
            };
        } catch (error) {
            return null;
        }
    }

    return {
        parseAmount,
        classifyError,
        serializeCache,
        readCache,
        relativeTime,
        formatTimestamp,
        RATES_URL,
        CURRENCIES,
        CODES,
        parseRates,
        rateBetween,
        convert,
        formatMoney,
        formatRate
    };
});
