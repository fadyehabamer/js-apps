let input = document.querySelector(".get-repos input"),
    getbtn = document.querySelector(".getrepobtn"),
    showdata = document.querySelector(".showdata");


getbtn.onclick = function () {
    getRepos()


}




// Get Repos
function getRepos() {



    if (input.value == "") {
        // sweet alert
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Enter Github Username !',
        })
    } else {
        fetch(`https://api.github.com/users/${input.value}/repos`)
            .then(response => response.json())
            .then((repos) => {
                showdata.innerHTML = "";
                // console.log(repos)
                repos.forEach(repo => {
                    // console.log(repo.name)

                    let maindiv = document.createElement("div")
                    let reponametext = document.createTextNode(repo.name)
                    maindiv.appendChild(reponametext)

                    let url = document.createElement("a")
                    let urltext = document.createTextNode("Visit")
                    url.appendChild(urltext)
                    url.href = `https://github.com/${input.value}/${repo.name}`
                    url.setAttribute("target", "_blank")

                    maindiv.appendChild(url)


                    let stars = document.createElement("span")
                    let starstext = document.createTextNode(`⭐ stars : ${repo.stargazers_count}`)
                    stars.appendChild(starstext);
                    maindiv.appendChild(stars)



                    maindiv.className = "repo-box"
                    showdata.append(maindiv)

                })
            });

    }


}













