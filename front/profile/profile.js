"use strict";

import {ACHIEVEMENTS_URL, API_URL} from "../util/path.js";
import {BASE_URL} from "../util/frontPath.js";

let userId = localStorage.getItem("userId");
let username = localStorage.getItem("username");
let token = localStorage.getItem("token");

document.getElementById("displayed-username").innerText = username;


let achievements = await getUserAchievements();

console.log("my achievements", achievements);


let allPossibleAchievements = await getAllPossibleAchievements();

console.log("allPossibleAchievements", allPossibleAchievements);

let achievementsDiv = document.getElementById("achievements");
achievements.forEach(achievement => {
    let achievementDiv = document.createElement("li");
    achievementDiv.classList.add("achievement");
    achievementDiv.innerText = achievement.achievementId + " - " + "débloqué (100%)";
    achievementsDiv.appendChild(achievementDiv);
});

// methods ------------------------------------------------------------------------------------------------------------

function getAllPossibleAchievements() {
    return callAPI(BASE_URL + API_URL + ACHIEVEMENTS_URL + "getAllPossible/", "post");
}

function getUserAchievements() {
    return callAPI(BASE_URL + API_URL + ACHIEVEMENTS_URL + "getAll/", "post");
}

function callAPI(url, method) {
    return fetch(url, {
        method: method, headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error while calling API" + response.status)
        }
        return response.json();
    }).then((object) => {
        return object;
    }).catch(error => {
        console.log(error);
    });
}