const { removeTashkeel, normalizeArabic } = ArabicText;

const input = document.getElementById("input-text");
const output = document.getElementById("output-text");
const optAlef = document.getElementById("opt-alef");
const optYa = document.getElementById("opt-ya");
const optTa = document.getElementById("opt-ta");
const optTatweel = document.getElementById("opt-tatweel");

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
