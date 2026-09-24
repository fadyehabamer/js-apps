let input = document.querySelector(".get-repos input"),
    getbtn = document.querySelector(".getrepobtn"),
    showdata = document.querySelector(".showdata");


getbtn.onclick = function () {
    getRepos()


}




// Get Repos
function getRepos() {

    let username = input.value.trim()

    if (username == "") {
        // sweet alert
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Enter Github Username !',
        })
    } else {
        fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos`)
            .then(response => {
                if (response.status === 404) {
                    throw new Error(`Github user "${username}" was not found !`)
                }
                if (response.status === 403 || response.status === 429) {
                    throw new Error('Github API rate limit reached, try again later.')
                }
                if (!response.ok) {
                    throw new Error(`Github API error (${response.status}), try again later.`)
                }
                return response.json()
            })
            .then((repos) => {
                showdata.innerHTML = "";

                if (repos.length === 0) {
                    showMessage(`${username} has no public repos.`)
                    return
                }

                // console.log(repos)
                repos.forEach(repo => {
                    // console.log(repo.name)

                    let maindiv = document.createElement("div")
                    let reponametext = document.createTextNode(repo.name)
                    maindiv.appendChild(reponametext)

                    let url = document.createElement("a")
                    let urltext = document.createTextNode("Visit")
                    url.appendChild(urltext)
                    url.href = repo.html_url
                    url.setAttribute("target", "_blank")

                    maindiv.appendChild(url)


                    let stars = document.createElement("span")
                    let starstext = document.createTextNode(`⭐ stars : ${repo.stargazers_count}`)
                    stars.appendChild(starstext);
                    maindiv.appendChild(stars)



                    maindiv.className = "repo-box"
                    showdata.append(maindiv)

                })
            })
            .catch((error) => {
                showMessage("No Data to show ...")

                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    // fetch() rejects with a TypeError when the network request itself fails
                    text: error instanceof TypeError ? 'Could not reach GitHub, check your connection.' : error.message,
                })
            });

    }


}

// Replace the results area with a single text message
function showMessage(text) {
    showdata.innerHTML = ""
    let msg = document.createElement("span")
    msg.textContent = text
    showdata.appendChild(msg)
}
