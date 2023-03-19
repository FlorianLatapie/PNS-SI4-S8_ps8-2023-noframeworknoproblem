import {API_URL, BASE_URL, LOGIN_URL, SIGNUP_URL, USERS_URL} from "../path.js";

window.addEventListener('load', function () {
    console.log("search.js loaded");
    document.getElementById("search-form").addEventListener("submit", function (event) {
        console.log("search-form submitted");
        event.preventDefault();
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
            console.log(response);
            if (response.status === 201) {
                // TODO: Display the users on the page
                console.log("every works fine");
                console.log(response.json());
            }
        });
    });
});
