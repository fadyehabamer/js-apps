const { PRAYERS, buildUrl, parseResponse } = PrayerLogic;

const form = document.getElementById("city-form");
const cityInput = document.getElementById("city");
const countryInput = document.getElementById("country");
const methodSelect = document.getElementById("method");
const dateLine = document.getElementById("date-line");
const timesList = document.getElementById("times-list");

function renderTimes(result, query) {
    dateLine.textContent = `${query.city}, ${query.country} · ${result.gregorian}`;
    timesList.replaceChildren();
    for (const name of PRAYERS) {
        const item = document.createElement("li");
        const label = document.createElement("span");
        label.textContent = name;
        const time = document.createElement("span");
        time.className = "time";
        time.textContent = result.timings[name];
        item.append(label, time);
        timesList.appendChild(item);
    }
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
