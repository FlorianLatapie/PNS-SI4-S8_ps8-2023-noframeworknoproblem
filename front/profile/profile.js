"use strict";

import {ACHIEVEMENTS_URL, API_URL} from "../util/path.js";
import {BASE_URL} from "../util/frontPath.js";
import {achievementRepresentation} from "../templates/achievement/achievementRepresentation.js";

let myUserId = localStorage.getItem("userId");
let myUserName = localStorage.getItem("username");

let url = new URL(window.location.href);
let userIdOfThisPage = url.searchParams.get("userId");

let itIsMyProfile = myUserId === userIdOfThisPage;

if (itIsMyProfile) {
    document.getElementById("salutation").innerText = "Bonjour " + myUserName + " !";
} else {

    document.getElementById("salutation").innerText = "Bienvenue sur la page de " + myUserName + " !";
}



let achievements = await getUserAchievements();
console.log("my achievements", achievements);


let allPossibleAchievements = await getAllPossibleAchievements();
console.log("allPossibleAchievements", allPossibleAchievements);

let achievementsDiv = document.getElementById("achievements");

for (let achievementElement of Object.entries(allPossibleAchievements)) {
    let achievementId = achievementElement[0];
    let achievement = achievementElement[1];
    console.log("achievement", achievementElement);

    console.log("achievement", achievement);
    let userAchievement = achievements.find(userAchievement => userAchievement.achievementId === achievementId);
    console.log("userAchievement", userAchievement);

    if (!achievement.isHidden || (achievement.isHidden && userAchievement && userAchievement.obtained)) {
        console.log("achievement respecting the constraints", achievement)
        let name = achievement.friendlyName;
        let found = userAchievement.obtained;
        let advancement_ratio = userAchievement ? userAchievement.progress : 0;
        let goal = achievement.maxProgress;
        let srcImg = BASE_URL + achievement.imgSrc;
        let achievementDiv = achievementRepresentation(name, found, advancement_ratio, goal, srcImg);
        achievementsDiv.appendChild(achievementDiv);
    }
}

// methods ------------------------------------------------------------------------------------------------------------

function getAllPossibleAchievements() {
    return callAPI(BASE_URL + API_URL + ACHIEVEMENTS_URL + "getAllPossible/", "post");
}

function getUserAchievements(userId) {
    return callAPI(BASE_URL + API_URL + ACHIEVEMENTS_URL + "getAll/" + userId
        , "post");
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
