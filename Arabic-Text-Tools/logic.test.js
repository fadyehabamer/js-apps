const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
    removeTashkeel,
    removeTatweel,
    normalizeAlef,
    normalizeYa,
    normalizeTaMarbuta,
    normalizeArabic,
    countWords,
    countLetters,
    countArabicLetters,
    countTashkeel,
    textStats,
    toWesternDigits,
    toArabicDigits
} = require("./logic.js");

test("removes harakat, shadda, tanween and dagger alef", () => {
    assert.equal(removeTashkeel("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"), "بسم الله الرحمن الرحيم");
    assert.equal(removeTashkeel("كِتَابٌ جَمِيلٌ"), "كتاب جميل");
    assert.equal(removeTashkeel("no marks here"), "no marks here");
});

test("keeps letters that look like marks", () => {
    assert.equal(removeTashkeel("أإآءؤئ"), "أإآءؤئ");
});

test("removes tatweel", () => {
    assert.equal(removeTatweel("جمـــيل"), "جميل");
});

test("normalises each letter group on its own", () => {
    assert.equal(normalizeAlef("أحمد إبراهيم آمال ٱلله"), "احمد ابراهيم امال الله");
    assert.equal(normalizeYa("على مستشفى"), "علي مستشفي");
    assert.equal(normalizeTaMarbuta("مدرسة جميلة"), "مدرسه جميله");
});

test("normaliseArabic respects options", () => {
    const text = "إلى المدرسة ـ";
    assert.equal(normalizeArabic(text), "الي المدرسه ");
    assert.equal(normalizeArabic(text, { taMarbuta: false }), "الي المدرسة ");
    assert.equal(normalizeArabic(text, { alef: false, ya: false, taMarbuta: false, tatweel: false }), text);
});

test("counts words across whitespace and ignores stray punctuation", () => {
    assert.equal(countWords(""), 0);
    assert.equal(countWords("   "), 0);
    assert.equal(countWords("مرحبا   بالعالم\nhello"), 3);
    assert.equal(countWords("كلمة - كلمة ، 2026"), 3);
});

test("counts letters without marks or tatweel", () => {
    assert.equal(countLetters("بِسْمِ"), 3);
    assert.equal(countLetters("جمـــيل abc 123"), 7);
    assert.equal(countArabicLetters("جمـــيل abc 123"), 4);
    assert.equal(countTashkeel("بِسْمِ"), 3);
});

test("textStats counts code points, not UTF-16 units", () => {
    const stats = textStats("سلام 😀");
    assert.equal(stats.characters, 6);
    assert.equal(stats.words, 1);
    assert.equal(stats.letters, 4);
});

test("converts Arabic-Indic and Persian digits to Western", () => {
    assert.equal(toWesternDigits("٠١٢٣٤٥٦٧٨٩"), "0123456789");
    assert.equal(toWesternDigits("۰۱۲۳۴۵۶۷۸۹"), "0123456789");
    assert.equal(toWesternDigits("صفحة ١٢"), "صفحة 12");
});

test("converts Western digits to Arabic-Indic", () => {
    assert.equal(toArabicDigits("0123456789"), "٠١٢٣٤٥٦٧٨٩");
    assert.equal(toArabicDigits("سنة 2026"), "سنة ٢٠٢٦");
    assert.equal(toWesternDigits(toArabicDigits("12:45")), "12:45");
});
