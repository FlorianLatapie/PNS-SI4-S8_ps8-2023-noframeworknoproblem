import {API_URL, BASE_URL, HOME_URL, USERS_URL} from "../path.js";
import {createUserPreviewDiv} from "../templates/userInList/UserRepresentationInList.js";

const usersListContainer = document.getElementById("search-result");
window.addEventListener('load', function () {
    document.getElementById("search-form").addEventListener("submit", function (event) {
        event.preventDefault();
        removeUsersListContent();

        let name = document.getElementById("form-username").value
        fetch(BASE_URL + API_URL + USERS_URL + "getName?" + new URLSearchParams({
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
            }
            return response.json()
        }).then(data => data.forEach(user => {
            usersListContainer.appendChild(createUserPreviewDiv(user));
        }))
    });
});

function removeUsersListContent() {
    usersListContainer.innerHTML = ""
}


