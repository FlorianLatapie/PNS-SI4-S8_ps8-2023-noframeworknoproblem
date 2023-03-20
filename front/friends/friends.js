import {API_URL, BASE_URL, FRIENDS_URL, HOME_URL} from "../path.js";

window.addEventListener('load', function () {
    fetch(BASE_URL + API_URL + FRIENDS_URL + "get", {
        method: "get", headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        console.log("Response status " + response.status);
        if (!response.ok) {
            console.log("Error while retrieving users", response.status)
            // There is an error
        }
        return response.json()

    }).then(data => data.forEach(user => {
        // Add a user case on the web page
        addUserRepresentation(user);
    }))
});

function addUserRepresentation(userObj) {
    const container = document.createElement('div');
    const img = document.createElement('img');
    const usernameContainer = document.createElement('p')

    // TODO change the link to redirect to the user page
    container.addEventListener("click", () => {
        window.location.replace(BASE_URL + HOME_URL)
    })

    container.classList.add("flex-row", "userProfil");
    img.classList.add("profil_image");

    img.src = "../images/user-solid.svg"
    img.alt = "Profil image"

    usernameContainer.innerHTML = userObj.username;

    const fragment = document.createDocumentFragment();
    fragment.appendChild(img)
    fragment.appendChild(usernameContainer)

    container.appendChild(fragment)

    document.getElementById("users-result").appendChild(container)
}


