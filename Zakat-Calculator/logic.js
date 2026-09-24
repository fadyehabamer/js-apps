(function (root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    } else {
        root.ZakatLogic = api;
    }
})(typeof self !== "undefined" ? self : this, function () {
    const NISAB_GOLD_GRAMS = 85;
    const ZAKAT_RATE = 0.025;

    function roundMoney(value) {
        return Math.round(value * 100) / 100;
    }

    function calculateZakat(values) {
        const goldValue = values.goldGrams * values.goldPrice;
        const silverValue = values.silverGrams * values.silverPrice;
        const items = [
            { key: "cash", label: "Cash and bank balances", value: roundMoney(values.cash) },
            { key: "gold", label: `Gold (${values.goldGrams} g)`, value: roundMoney(goldValue) },
            { key: "silver", label: `Silver (${values.silverGrams} g)`, value: roundMoney(silverValue) },
            { key: "trade", label: "Trade goods", value: roundMoney(values.tradeGoods) }
        ];
        const total = roundMoney(items.reduce((sum, item) => sum + item.value, 0));
        const nisab = roundMoney(NISAB_GOLD_GRAMS * values.goldPrice);
        const due = total > 0 && total >= nisab;
        return {
            items,
            total,
            nisab,
            due,
            zakat: due ? roundMoney(total * ZAKAT_RATE) : 0,
            shortBy: due ? 0 : roundMoney(nisab - total)
        };
    }

    const CURRENCIES = ["EGP", "SAR", "AED", "KWD", "QAR", "USD", "EUR", "GBP"];

    function formatMoney(value, currency, locale) {
        return new Intl.NumberFormat(locale || "en", {
            style: "currency",
            currency,
            currencyDisplay: "code"
        }).format(value);
    }

    return {
        CURRENCIES,
        formatMoney,
        NISAB_GOLD_GRAMS,
        ZAKAT_RATE,
        roundMoney,
        calculateZakat
    };
});
