"use strict";

import {BASE_URL} from "../util/frontPath.js";
import {ACHIEVEMENTS_URL, API_URL, FRIENDS_URL, USERS_URL} from "../util/path.js";
import {informativePopUp} from "../templates/popUp/informativePopUp/informativePopUp.js";

// Script --------------------------------------------------------------------------------------------------------------
let url = new URL(window.location.href);
let userIdOfThisPage = url.searchParams.get("userId");

if (!isUserValid(userIdOfThisPage)) {
    whenError();
}

let userPromise = fetch(BASE_URL + API_URL + USERS_URL + "get/" + userIdOfThisPage, {
    method: 'get', headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
}).then((response) => {
    if (!response.ok) {
        throw new Error("Error while calling API" + response.status)
    }
    return response.json();
}).then((data) => {
    console.log("userpromise data", data);
    return data;
}).catch(error => {
    whenError();
});

let user = await userPromise;
let username = user.username;

let title = document.getElementById("page-title");
title.innerHTML = "Profil de " + username;

let greeting = document.getElementById("greeting");
greeting.innerHTML = "Bienvenue sur la page de " + username + " !";

let achievementsPromise = fetch(BASE_URL + API_URL + ACHIEVEMENTS_URL + "getAll/", {
    method: "post", headers: {
        'Accept': 'application/json', 'Content-Type': 'application/json'
    }, body: JSON.stringify({token: localStorage.getItem("token"), userId: userIdOfThisPage})
}).then(async (response) => {
    if (!response.ok) {
        throw new Error("Error while calling API" + response.status)
    }
    return response.json();
}).then((data) => {
    return data;
}).catch(error => {
    console.log(error);
});

// button -------------------------------------

await updateButton();

// achievements -------------------------------------

let achievements = await achievementsPromise;

if (achievements.length === 0) {
    let success = document.getElementById("successes");
    success.innerHTML = "Aucun succès débloqué pour le moment.";
}

let achievementsDiv = document.getElementById("achievements");
achievements.forEach(achievement => {
    let achievementDiv = document.createElement("li");
    achievementDiv.classList.add("achievement");
    achievementDiv.innerText = achievement.achievementId + " - " + "débloqué (100%)";
    achievementsDiv.appendChild(achievementDiv);
});

// Functions -----------------------------------------------------------------------------------------------------------
function isUserValid(userId) {
    return Boolean(userId);
}

function whenError() {
    informativePopUp("User '" + userIdOfThisPage + "' not found, redirecting to home page...", () => window.location.replace(BASE_URL));
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
        console.log("callFriendAPI data :", data);
        return data;
    }).catch(error => {
        console.log(error);
    });
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

async function updateButton() {
    let friendshipButton = document.getElementById("friendship-button");

    let status = await getStatus(userIdOfThisPage);

    // Clone the button to remove existing event listeners
    let newButton = friendshipButton.cloneNode(true);
    friendshipButton.parentNode.replaceChild(newButton, friendshipButton);
    friendshipButton = newButton;

    switch (status) {
        case "request":
            friendshipButton.innerHTML = "Annuler la demande d'ami";
            friendshipButton.addEventListener("click", async () => {
                cancelRequest(userIdOfThisPage).then(() => {
                    updateButton();
                });
            });

            break;
        case "friend":
            friendshipButton.innerHTML = "Retirer de mes amis";
            friendshipButton.addEventListener("click", async () => {
                removeFriend(userIdOfThisPage).then(() => {
                    updateButton();
                });
            });

            break;
        case "pending":
            friendshipButton.innerHTML = "Accepter la demande";
            friendshipButton.addEventListener("click", async () => {
                acceptFriend(userIdOfThisPage).then(() => {
                    updateButton();
                });
            });
            break;

        case "none":
            friendshipButton.innerHTML = "Ajouter aux amis";
            friendshipButton.addEventListener("click", async () => {
                addFriend(userIdOfThisPage).then(() => {
                    updateButton();
                });
            });
            break;
    }
}
