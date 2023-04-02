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
    if (!response.ok) {
        console.log("Error while retrieving users from back", response.status);
    }
    return response.json();
}).then(data => {
    // table : <th>Position</th> <th>Pseudo</th> <th>ELO</th>
    let tbody = document.getElementById("ranking");

    let counter = 1;
    data.forEach(userInDb => {
        console.log(userInDb); // elo and name
        let tr = document.createElement("tr");
        let tdPosition = document.createElement("td");
        let tdPseudo = document.createElement("td");
        let tdElo = document.createElement("td");

        tdPosition.innerText = counter++;
        tdPseudo.innerText = userInDb.username;
        tdElo.innerText = userInDb.elo;

        tr.appendChild(tdPosition);
        tr.appendChild(tdPseudo);
        tr.appendChild(tdElo);
        tbody.appendChild(tr);

    })
})
