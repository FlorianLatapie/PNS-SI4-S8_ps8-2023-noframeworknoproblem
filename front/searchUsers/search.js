import {API_URL, BASE_URL, HOME_URL, USERS_URL} from "../path.js";
import {createUserRepresentation} from "../templates/UserRepresentationInList.js";

const usersListContainer = document.getElementById("search-result");
window.addEventListener('load', function () {
    document.getElementById("search-form").addEventListener("submit", function (event) {
        event.preventDefault();
        suppressAllUsersRepresentations();
        let name = document.getElementById("form-username").value
        fetch(BASE_URL + API_URL + USERS_URL + "get?" + new URLSearchParams({
            name: name
        }), {
            method: "get", headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            if (!response.ok) {
                console.log("Error while retrieving users", response.status)
                // There is an error
            }
            return response.json()

        }).then(data => data.forEach(user => {
            // Add a user case on the web page
            usersListContainer.appendChild(createUserRepresentation(user));
        }))
    });
});

function suppressAllUsersRepresentations() {
    usersListContainer.innerHTML = ""
}


