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

    return {
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
