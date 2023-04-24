import {parseJwt} from "../util/jwtParser.js";
import {API_URL, HOME_URL, LOGIN_URL, SIGNUP_URL} from "../util/path.js";
import {BASE_URL} from "../util/frontPath.js";
import {informativePopUp} from "../templates/popUp/informativePopUp/informativePopUp.js";

document.getElementById("signup").addEventListener("click", function () {
    window.location.replace(BASE_URL + SIGNUP_URL);
});

document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const values = {
        username: document.getElementById("login-username").value,
        password: document.getElementById("login-password").value,
    }

    fetch(BASE_URL + API_URL + LOGIN_URL, {
        method: "post", headers: {
            'Accept': 'application/json', 'Content-Type': 'application/json'
        }, body: JSON.stringify(values)
    }).then(async (response) => {
        if (!response.ok) {
            informativePopUp("La combinaison nom d'utilisateur/mot de passe est incorrecte.");
            return;
        }
        let jwtToken = await response.text();
        localStorage.setItem("token", jwtToken);

        let parsedJwt = parseJwt(jwtToken);

        let username = parsedJwt.username;
        localStorage.setItem("username", username);

        let userId = parsedJwt.userId;
        localStorage.setItem("userId", userId);
        //console.log("userId: " + userId);
        window.location.replace(BASE_URL + HOME_URL);
    });
});