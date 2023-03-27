"use strict";

import {ACHIEVEMENTS_URL, API_URL} from "../util/path.js";
import {BASE_URL} from "../util/frontPath.js";

let userId = localStorage.getItem("userId");
let username = localStorage.getItem("username");
let token = localStorage.getItem("token");

document.getElementById("displayed-username").innerText = username;

fetch(BASE_URL + API_URL + ACHIEVEMENTS_URL + "getAll/", {
    method: "post", headers: {
        'Accept': 'application/json', 'Content-Type': 'application/json'
    }, body: JSON.stringify({token: token, userId: userId})
}).then(async (response) => {
    let responseText = await response.text();
    let achievements = JSON.parse(responseText);

    let achievementsDiv = document.getElementById("achievements");
    achievements.forEach(achievement => {
        let achievementDiv = document.createElement("li");
        achievementDiv.classList.add("achievement");
        achievementDiv.innerText = achievement.achievementId + " - " + "débloqué (100%)";
        achievementsDiv.appendChild(achievementDiv);
    });
});