let second = 1000,
    minute = second * 60,
    hour = minute * 60,
    day = hour * 24;

// Count down to midnight on 1 January of the coming year
let countdown = new Date(new Date().getFullYear() + 1, 0, 1).getTime();

function updateCountdown() {
    let now = new Date().getTime();

    let distance = countdown - now;

    if (distance < 0) {
        let headline = document.querySelector('h1');
        let counter = document.querySelector('.counter');

        headline.innerText = "Happy New Year";

        counter.style.display = 'none';

        clearInterval(timer);
        return;
    }

    document.getElementById('days').innerText = Math.floor(distance / day);

    document.getElementById('hours').innerText = Math.floor((distance % day) / hour);

    document.getElementById('minutes').innerText = Math.floor((distance % hour) / minute);

    document.getElementById('seconds').innerText = Math.floor((distance % minute) / second);
}

let timer = setInterval(updateCountdown, second);
updateCountdown();
