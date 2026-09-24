const APIURL =
    "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=04c35731a5ee918f014970082a0088b1&page=1";
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI =
    "https://api.themoviedb.org/3/search/movie?&api_key=04c35731a5ee918f014970082a0088b1&query=";

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");

// initially get fav movies
getMovies(APIURL);

async function getMovies(url) {
    try {
        const resp = await fetch(url);

        if (!resp.ok) {
            throw new Error(`TMDB request failed (${resp.status})`);
        }

        const respData = await resp.json();

        showMovies(respData.results || []);
    } catch (error) {
        console.error(error);
        showMessage("Could not load movies right now, please try again later.");
    }
}

// replace the movie grid with a single text message
function showMessage(text) {
    main.innerHTML = "";

    const msg = document.createElement("h2");
    msg.classList.add("message");
    msg.textContent = text;

    main.appendChild(msg);
}

function showMovies(movies) {
    // clear main
    main.innerHTML = "";

    if (movies.length === 0) {
        showMessage("No movies found.");
        return;
    }

    movies.forEach((movie) => {
        const { poster_path, title, vote_average, overview } = movie;

        // build the card with DOM APIs so API text is never parsed as HTML
        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");

        const img = document.createElement("img");
        img.src = poster_path ? IMGPATH + poster_path : "./notfound.png";
        img.alt = title;

        const info = document.createElement("div");
        info.classList.add("movie-info");

        const heading = document.createElement("h3");
        heading.textContent = title;

        const rating = document.createElement("span");
        rating.classList.add(getClassByRate(vote_average));
        rating.textContent = vote_average;

        info.append(heading, rating);

        const overviewEl = document.createElement("div");
        overviewEl.classList.add("overview");

        const overviewTitle = document.createElement("h3");
        overviewTitle.textContent = "Overview:";

        overviewEl.append(overviewTitle, overview || "");

        movieEl.append(img, info, overviewEl);

        main.appendChild(movieEl);
    });
}

function getClassByRate(vote) {
    if (vote >= 8) {
        return "green";
    } else if (vote >= 5) {
        return "orange";
    } else {
        return "red";
    }
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const searchTerm = search.value;

    if (searchTerm) {
        getMovies(SEARCHAPI + encodeURIComponent(searchTerm));

        search.value = "";
    }
});
