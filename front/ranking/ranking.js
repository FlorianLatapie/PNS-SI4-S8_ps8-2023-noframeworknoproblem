import {BASE_URL} from "../util/frontPath.js";
import {API_URL, STATS_API_URL} from "../util/path.js";

let ranking = document.getElementById("ranking");
fetch(BASE_URL + API_URL + STATS_API_URL + `getAllElo/`, {
    method: "get", headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
}).then((response) => {
    console.log(response)
    if (!response.ok) {
        console.log("Error while retrieving users from back", response.status);
    }
    return response.json();
}).then(data => {
    data.forEach(userInDb => {
            console.log(userInDb)
            let user = document.createElement("div");
            user.className = "user";
            ranking.appendChild(user);
            let username = document.createElement("div");
            username.className = "username";
            username.innerHTML = userInDb.username;
            user.appendChild(username);
            let elo = document.createElement("div");
            elo.className = "elo";
            elo.innerHTML = userInDb.elo;
            user.appendChild(elo);

        }
    )
})
