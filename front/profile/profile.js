"use strict";

import {ACHIEVEMENTS_URL, API_URL, FRIENDS_URL, USERS_URL} from "../util/path.js";
import {BASE_URL} from "../util/frontPath.js";
import {achievementRepresentation} from "../templates/achievement/achievementRepresentation.js";

let myUserId = localStorage.getItem("userId");
let myUserName = localStorage.getItem("username");
let url = new URL(window.location.href);
let userIdOfThisPage = url.searchParams.get("userId");
let itIsMyProfile = !Boolean(userIdOfThisPage);

let userIdWeAreLookingAt = itIsMyProfile ? myUserId : userIdOfThisPage;
if (itIsMyProfile) {
    document.getElementById("salutation").innerText = "Bonjour " + myUserName + " !";
    populateAchievementsDiv(userIdWeAreLookingAt)
} else {
    let user = await getUser(userIdWeAreLookingAt);
    document.getElementById("salutation").innerText = "Bienvenue sur la page de " + user.username + " !";
    populateAchievementsDiv(userIdWeAreLookingAt)
    addFriendshipButton();
    await updateButton();
}

// functions ------------------------------------------------------------------------------------------------------------
function addFriendshipButton() {
    // add a button to the page
    let friendshipButton = document.createElement("button");
    friendshipButton.innerText = "Ajouter en ami";
    friendshipButton.id = "friendshipButton";
    // add this button to the page
    document.getElementById("friendshipButtonDiv").appendChild(friendshipButton);
}

async function updateButton() {
    let friendshipButton = document.getElementById("friendshipButton");

    let status = await getStatus(userIdOfThisPage);

    // Clone the button to remove existing event listeners
    let newButton = friendshipButton.cloneNode(true);
    friendshipButton.parentNode.replaceChild(newButton, friendshipButton);
    friendshipButton = newButton;

    switch (status) {
        case "request":
            friendshipButton.innerText = "Annuler la demande d'ami";
            friendshipButton.addEventListener("click", async () => {
                cancelRequest(userIdOfThisPage).then(() => {
                    updateButton();
                });
            });

            break;
        case "friend":
            friendshipButton.innerText = "Retirer de mes amis";
            friendshipButton.addEventListener("click", async () => {
                removeFriend(userIdOfThisPage).then(() => {
                    updateButton();
                });
            });

            break;
        case "pending":
            friendshipButton.innerText = "Accepter la demande";
            friendshipButton.addEventListener("click", async () => {
                acceptFriend(userIdOfThisPage).then(() => {
                    updateButton();
                });
            });
            break;

        case "none":
            friendshipButton.innerText = "Ajouter aux amis";
            friendshipButton.addEventListener("click", async () => {
                addFriend(userIdOfThisPage).then(() => {
                    updateButton();
                });
            });
            break;
    }
}

function getStatus(userId) {
    return callFriendAPI('get', 'friendshipStatus', userId);
}

function addFriend(userIdOfThisPage) {
    return callFriendAPI('post', 'add', userIdOfThisPage);
}

function acceptFriend(userIdOfThisPage) {
    return callFriendAPI('post', 'accept', userIdOfThisPage);
}

function cancelRequest(userIdOfThisPage) {
    return callFriendAPI('delete', 'removeRequest', userIdOfThisPage);
}

function removeFriend(userIdOfThisPage) {
    return callFriendAPI('delete', 'removeFriend', userIdOfThisPage);
}

async function populateAchievementsDiv(userId) {
    let achievements = await getUserAchievements(userId);
    let allPossibleAchievements = await getAllPossibleAchievements();

    let achievementsDiv = document.getElementById("achievements");

    for (let achievementElement of Object.entries(allPossibleAchievements)) {
        let achievementId = achievementElement[0];
        let achievement = achievementElement[1];

        let userAchievement = achievements.find(userAchievement => userAchievement.achievementId === achievementId);

        if (userAchievement && (!achievement.isHidden || (achievement.isHidden && userAchievement.obtained))) {
            let name = achievement.friendlyName;
            let found = userAchievement.obtained;
            let advancement_ratio = userAchievement ? userAchievement.progress : 0;
            let goal = achievement.maxProgress;
            let srcImg = BASE_URL + achievement.imgSrc;
            let achievementDiv = achievementRepresentation(name, found, advancement_ratio, goal, srcImg);
            achievementsDiv.appendChild(achievementDiv);
        }

    }
}

function getAllPossibleAchievements() {
    return callAPI(BASE_URL + API_URL + ACHIEVEMENTS_URL + "getAllPossible/", "post");
}

function getUserAchievements(userId) {
    return callAPI(BASE_URL + API_URL + ACHIEVEMENTS_URL + "getAll/" + userId, "post");
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

function callFriendAPI(method, subUrl, userId) {
    return fetch(BASE_URL + API_URL + FRIENDS_URL + subUrl + "/" + userId, {
        method: method, headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error while calling API (button) " + response.status)
        }
        return response.text();
    }).then((data) => {
        return data;
    }).catch(error => {
        console.log(error);
    });
}

function getUser(userId) {
    return callAPI(BASE_URL + API_URL + USERS_URL + "get/" + userId, "get");
}
