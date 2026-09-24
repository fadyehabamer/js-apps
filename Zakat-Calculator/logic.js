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

    const FIELDS = ["goldPrice", "cash", "goldGrams", "silverGrams", "silverPrice", "tradeGoods"];
    const MAX_AMOUNT = 1e15;

    function parseAmount(raw) {
        const text = String(raw == null ? "" : raw)
            .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
            .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 0x06F0))
            .replace(/\u066B/g, ".")
            .replace(/[\s,\u066C_]/g, "");
        if (text === "") {
            return null;
        }
        if (!/^(\d+\.?\d*|\.\d+)$/.test(text)) {
            return NaN;
        }
        return Number(text);
    }

    function validateInputs(raw) {
        const values = {};
        const errors = {};
        for (const field of FIELDS) {
            const amount = parseAmount(raw[field]);
            if (amount === null) {
                values[field] = 0;
            } else if (Number.isNaN(amount)) {
                errors[field] = "Enter a number of 0 or more, like 1500 or 1,500.50.";
            } else if (amount > MAX_AMOUNT) {
                errors[field] = "That number is too large.";
            } else {
                values[field] = amount;
            }
        }
        if (!errors.goldPrice && !(values.goldPrice > 0)) {
            errors.goldPrice = "Enter today's price of 1 g of gold. It sets the nisab.";
        }
        if (!errors.silverPrice && !errors.silverGrams && values.silverGrams > 0 && !(values.silverPrice > 0)) {
            errors.silverPrice = "Enter the silver price so your silver can be valued.";
        }
        return { values, errors, valid: Object.keys(errors).length === 0 };
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
        parseAmount,
        validateInputs,
        calculateZakat
    };
});
