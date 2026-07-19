let second = 1000,
    minute = second * 60,
    hour = minute * 60,
    day = hour * 24;

let finalTime = "Dec 31, 2021 00:00:00"

let countdown = new Date(finalTime).getTime();

setInterval(() => {
    let now = new Date().getTime();

    let distance = countdown - now;

    document.getElementById('days').innerText = Math.floor(distance / day);

    document.getElementById('hours').innerText = Math.floor((distance % day) / hour);

    document.getElementById('minutes').innerText = Math.floor((distance % hour) / minute);

    document.getElementById('seconds').innerText = Math.floor((distance % minute) / second);

    if (distance < 0) {
        let headline = document.querySelector('h1');
        let counter = document.querySelector('.counter');

        headline.innerText = "Happy New Year";

        counter.style.display = 'none';
    }


})