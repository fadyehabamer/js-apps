const { removeTashkeel, normalizeArabic, textStats } = ArabicText;

const input = document.getElementById("input-text");
const output = document.getElementById("output-text");
const optAlef = document.getElementById("opt-alef");
const optYa = document.getElementById("opt-ya");
const optTa = document.getElementById("opt-ta");
const optTatweel = document.getElementById("opt-tatweel");
const statFields = {
    words: document.getElementById("stat-words"),
    letters: document.getElementById("stat-letters"),
    arabicLetters: document.getElementById("stat-arabic"),
    tashkeel: document.getElementById("stat-tashkeel"),
    characters: document.getElementById("stat-chars")
};

function updateStats() {
    const stats = textStats(input.value);
    for (const [key, element] of Object.entries(statFields)) {
        element.textContent = stats[key].toLocaleString("en");
    }
}

const tools = {
    tashkeel: (text) => removeTashkeel(text),
    normalize: (text) => normalizeArabic(text, {
        alef: optAlef.checked,
        ya: optYa.checked,
        taMarbuta: optTa.checked,
        tatweel: optTatweel.checked
    })
};

document.querySelectorAll("[data-tool]").forEach((button) => {
    button.addEventListener("click", () => {
        output.value = tools[button.dataset.tool](input.value);
    });
});

input.addEventListener("input", updateStats);
updateStats();
