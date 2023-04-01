"use strict";

import {ACHIEVEMENTS_URL, API_URL} from "../util/path.js";
import {BASE_URL} from "../util/frontPath.js";
import {achievementRepresentation} from "../templates/achievement/achievementRepresentation.js";

let userId = localStorage.getItem("userId");
let username = localStorage.getItem("username");
let token = localStorage.getItem("token");

document.getElementById("salutation").innerText = `Bonjour ${username} !`;

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
    if (!achievement.isHidden || (achievement.isHidden && userAchievement)) {
        console.log("achievement respecting the constraints", achievement)
        let name = achievement.friendlyName;
        let found = userAchievement !== undefined;
        let advancement = userAchievement ? userAchievement.progress : 0;
        let goal = achievement.maxProgress;
        // let srcImg = allPossibleAchievements[achievementRepresentation.achievementId].imgSrc
        let srcImg = BASE_URL + achievement.imgSrc;
        let achievementDiv = achievementRepresentation(name, found, advancement, goal, srcImg);
        achievementsDiv.appendChild(achievementDiv);
    }
}

// methods ------------------------------------------------------------------------------------------------------------

function getFriendlyName(achievementId, allAchievementsObject) {

}

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
