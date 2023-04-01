import {PARAMETER_NAME_IA_PLAYS} from "../constant.js";
import {API_URL, PLAY_AI_URL, USERS_URL} from "../../../util/path.js";
import {BASE_URL} from "../../../util/frontPath.js";

fetch(BASE_URL + API_URL + USERS_URL + "getCurrentAIGame/", {
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
    let userId = localStorage.getItem("userId");
    let url = BASE_URL + PLAY_AI_URL + "?" + PARAMETER_NAME_IA_PLAYS + "=";
    if (data.player1 === userId){
        window.location.href = url + "2";
    } else if (data.player2 === userId){
        window.location.href = url + "1";
    }
})

let form = document.getElementById("form-position")
form.addEventListener("submit", function (event) {
    event.preventDefault();
    let AIplays = document.querySelector("input[name=\"AIplays\"]:checked").value;
    form.method = "get";
    form.action = BASE_URL + PLAY_AI_URL + "?" + PARAMETER_NAME_IA_PLAYS + "=" + AIplays;
    form.submit();
});
