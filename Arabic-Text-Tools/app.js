const { removeTashkeel, normalizeArabic, toWesternDigits, toArabicDigits, textStats } = ArabicText;

const input = document.getElementById("input-text");
const output = document.getElementById("output-text");
const optAlef = document.getElementById("opt-alef");
const optYa = document.getElementById("opt-ya");
const optTa = document.getElementById("opt-ta");
const optTatweel = document.getElementById("opt-tatweel");
const copyButton = document.getElementById("copy-btn");
const reuseButton = document.getElementById("reuse-btn");
const clearButton = document.getElementById("clear-btn");
const statusLine = document.getElementById("status");
const statFields = {
    words: document.getElementById("stat-words"),
    letters: document.getElementById("stat-letters"),
    arabicLetters: document.getElementById("stat-arabic"),
    tashkeel: document.getElementById("stat-tashkeel"),
    characters: document.getElementById("stat-chars")
};

function setStatus(message, kind) {
    statusLine.textContent = message;
    statusLine.className = kind ? `status ${kind}` : "status";
}

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
    }),
    western: (text) => toWesternDigits(text),
    eastern: (text) => toArabicDigits(text)
};

document.querySelectorAll("[data-tool]").forEach((button) => {
    button.addEventListener("click", () => {
        if (!input.value.trim()) {
            setStatus("Type or paste some text first.", "error");
            input.focus();
            return;
        }
        output.value = tools[button.dataset.tool](input.value);
        setStatus(output.value === input.value ? "Done. Nothing needed changing." : "Done.", "ok");
    });
});

async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            return copyWithSelection();
        }
    }
    return copyWithSelection();
}

function copyWithSelection() {
    output.focus();
    output.select();
    try {
        return document.execCommand("copy");
    } catch (error) {
        return false;
    }
}

copyButton.addEventListener("click", async () => {
    if (!output.value) {
        setStatus("Nothing to copy yet. Run one of the tools first.", "error");
        return;
    }
    const copied = await copyText(output.value);
    if (copied) {
        setStatus("Copied to the clipboard.", "ok");
    } else {
        setStatus("Couldn't copy automatically. The text is selected, press Ctrl+C (or Cmd+C).", "error");
    }
});

reuseButton.addEventListener("click", () => {
    if (!output.value) {
        setStatus("There's no result to reuse yet.", "error");
        return;
    }
    input.value = output.value;
    updateStats();
    setStatus("Result moved to the input.", "ok");
});

clearButton.addEventListener("click", () => {
    input.value = "";
    output.value = "";
    updateStats();
    setStatus("", "");
    input.focus();
});

input.addEventListener("input", updateStats);
updateStats();
