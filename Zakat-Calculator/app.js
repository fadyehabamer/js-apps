const { calculateZakat } = ZakatLogic;

const form = document.getElementById("zakat-form");
const summary = document.getElementById("summary");

function readNumber(id) {
    const value = Number(document.getElementById(id).value);
    return Number.isFinite(value) ? value : 0;
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = calculateZakat({
        goldPrice: readNumber("gold-price"),
        cash: readNumber("cash"),
        goldGrams: readNumber("gold-grams"),
        silverGrams: readNumber("silver-grams"),
        silverPrice: readNumber("silver-price"),
        tradeGoods: readNumber("trade-goods")
    });
    if (result.due) {
        summary.textContent = `Total ${result.total}, nisab ${result.nisab}. Zakat due: ${result.zakat}.`;
    } else {
        summary.textContent = `Total ${result.total} is below the nisab of ${result.nisab}. No zakat is due.`;
    }
});
