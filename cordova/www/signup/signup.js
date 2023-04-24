import {API_URL, LOGIN_URL, SIGNUP_URL} from "../util/path.js";
import {BASE_URL} from "../util/frontPath.js";
import {informativePopUp} from "../templates/popUp/informativePopUp/informativePopUp.js";

document.getElementById("login").addEventListener("click", function () {
    window.location.replace(BASE_URL + LOGIN_URL);
});

window.addEventListener('load', function () {
    document.getElementById("signup-form").addEventListener("submit", function (event) {
        event.preventDefault();
        const values = {
            username: document.getElementById("signup-username").value,
            mail: document.getElementById("signup-email").value,
            password: document.getElementById("signup-password").value,
        }

        fetch(BASE_URL + API_URL + SIGNUP_URL, {
            method: "post", headers: {
                'Accept': 'application/json', 'Content-Type': 'application/json'
            }, body: JSON.stringify(values)
        }).then((response) => {
            if (!response.ok){
                informativePopUp("Le nom d'utilisateur ou l'adresse mail est déjà utilisé.")
                return;
            }
            if (response.status === 201) {
                window.location.replace(BASE_URL + LOGIN_URL);
            }
        });
    });
});

