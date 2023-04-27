import {PARAMETER_NAME_IA_PLAYS} from "../constant.js";
import {API_URL, PLAY_AI_URL, USERS_API} from "../../../util/path.js";
import {BASE_URL_API, BASE_URL_PAGE} from "../../../util/frontPath.js";

fetch(BASE_URL_API + API_URL + USERS_API + "getCurrentAIGame/", {
    method: "get", headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
}).then((response) => {
    return  response.json();
}).then(data => {
    if (data === null) {
        return;
    }
    console.log(data);
    let userId = localStorage.getItem("userId");
    let url = BASE_URL_PAGE + PLAY_AI_URL + "?" + PARAMETER_NAME_IA_PLAYS + "=";
    if (data.player1 === userId){
        window.location.href = url + "2";
    } else if (data.player2 === userId){
        window.location.href = url + "1";
    }
});

let firstButton = document.getElementById("first");
let secondButton = document.getElementById("second");
firstButton.addEventListener("click", function (event) {
    window.location.href= BASE_URL_PAGE + PLAY_AI_URL + "?" + PARAMETER_NAME_IA_PLAYS + "=2"
});
secondButton.addEventListener("click", function (event) {
    window.location.href= BASE_URL_PAGE + PLAY_AI_URL + "?" + PARAMETER_NAME_IA_PLAYS + "=1"
});

