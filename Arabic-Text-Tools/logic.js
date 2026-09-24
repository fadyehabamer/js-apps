(function (root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    } else {
        root.ArabicText = api;
    }
})(typeof self !== "undefined" ? self : this, function () {
    const TASHKEEL = /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۨ-ۭ]/g;
    const TATWEEL = /ـ/g;
    const ALEF_FORMS = /[آأإٱٲٳ]/g;
    const ALEF_MAQSURA = /ى/g;
    const TA_MARBUTA = /ة/g;

    function removeTashkeel(text) {
        return text.replace(TASHKEEL, "");
    }

    function removeTatweel(text) {
        return text.replace(TATWEEL, "");
    }

    function normalizeAlef(text) {
        return text.replace(ALEF_FORMS, "ا");
    }

    function normalizeYa(text) {
        return text.replace(ALEF_MAQSURA, "ي");
    }

    function normalizeTaMarbuta(text) {
        return text.replace(TA_MARBUTA, "ه");
    }

    function normalizeArabic(text, options) {
        const settings = { alef: true, ya: true, taMarbuta: true, tatweel: true, ...options };
        let result = text;
        if (settings.tatweel) {
            result = removeTatweel(result);
        }
        if (settings.alef) {
            result = normalizeAlef(result);
        }
        if (settings.ya) {
            result = normalizeYa(result);
        }
        if (settings.taMarbuta) {
            result = normalizeTaMarbuta(result);
        }
        return result;
    }

    return {
        removeTashkeel,
        removeTatweel,
        normalizeAlef,
        normalizeYa,
        normalizeTaMarbuta,
        normalizeArabic
    };
});
