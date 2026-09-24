const { PRAYERS, buildUrl, parseResponse, secondsOfDay, findNextPrayer, formatCountdown } = PrayerLogic;

const form = document.getElementById("city-form");
const cityInput = document.getElementById("city");
const countryInput = document.getElementById("country");
const methodSelect = document.getElementById("method");
const dateLine = document.getElementById("date-line");
const timesList = document.getElementById("times-list");
const nextBox = document.getElementById("next-box");
const nextLabel = document.getElementById("next-label");
const countdown = document.getElementById("countdown");

let current = null;
let timer = null;

function updateCountdown() {
    if (!current) {
        nextBox.hidden = true;
        return;
    }
    const now = secondsOfDay(new Date(), current.timezone);
    const next = findNextPrayer(current.timings, now);
    nextBox.hidden = false;
    nextLabel.textContent = next.tomorrow ? `Next: ${next.name} (tomorrow) in` : `Next: ${next.name} in`;
    countdown.textContent = formatCountdown(next.secondsLeft);
    for (const item of timesList.children) {
        item.classList.toggle("next", item.dataset.prayer === next.name && !next.tomorrow);
    }
}

function startCountdown() {
    clearInterval(timer);
    updateCountdown();
    timer = setInterval(updateCountdown, 1000);
}

function renderTimes(result, query) {
    dateLine.textContent = `${query.city}, ${query.country} · ${result.gregorian}`;
    timesList.replaceChildren();
    for (const name of PRAYERS) {
        const item = document.createElement("li");
        item.dataset.prayer = name;
        const label = document.createElement("span");
        label.textContent = name;
        const time = document.createElement("span");
        time.className = "time";
        time.textContent = result.timings[name];
        item.append(label, time);
        timesList.appendChild(item);
    }
    current = result;
    startCountdown();
}

async function loadTimes(query) {
    dateLine.textContent = "Loading...";
    try {
        const response = await fetch(buildUrl({ ...query, date: new Date() }));
        const json = await response.json();
        renderTimes(parseResponse(json), query);
    } catch (error) {
        dateLine.textContent = "Could not load prayer times.";
        timesList.replaceChildren();
        current = null;
        updateCountdown();
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    loadTimes({
        city: cityInput.value.trim(),
        country: countryInput.value.trim(),
        method: methodSelect.value
    });
});
