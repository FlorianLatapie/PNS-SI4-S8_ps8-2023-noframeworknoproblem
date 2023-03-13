"use strict";

import {ACHIEVEMENTS_URL, API_URL, BASE_URL} from "../path.js";

let userId = localStorage.getItem("userId");
let username = localStorage.getItem("username");

document.getElementById("displayed-username").innerText = username;
document.getElementById("unique-id").innerText = userId;

fetch(BASE_URL + API_URL + ACHIEVEMENTS_URL + "getAll/", {
    method: "post", headers: {
        'Accept': 'application/json', 'Content-Type': 'application/json'
    }, body: JSON.stringify({token: localStorage.getItem("token"), achievement: "konami"})
}).then(async (response) => {
    let responseText = await response.text();
    let achievements = JSON.parse(responseText);

    let achievementsDiv = document.getElementById("achievements");
    achievements.forEach(achievement => {
        let achievementDiv = document.createElement("div");
        achievementDiv.classList.add("achievement");
        achievementDiv.innerText = achievement.achievementId;
        achievementsDiv.appendChild(achievementDiv);
    });
});