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

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");

        movieEl.innerHTML = `
            <img
                src="${IMGPATH + poster_path}"
                alt="${title}"
            />
            <div class="movie-info">
                <h3>${title}</h3>
                <span class="${getClassByRate(
                    vote_average
                )}">${vote_average}</span>
            </div>
            <div class="overview">
                <h3>Overview:</h3>
                ${overview}
            </div>
        `;
        
          arr = document.querySelectorAll("img")
        for(let i = 0 ; i<arr.length; i++){
            // console.log(arr[i].src);
            if(arr[i].src.includes("null")){
                arr[i].src='./notfound.png'
            }
        }

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
