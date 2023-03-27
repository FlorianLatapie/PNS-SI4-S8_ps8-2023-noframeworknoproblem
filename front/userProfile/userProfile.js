"use strict";

import {BASE_URL} from "../util/frontPath.js";
import {ACHIEVEMENTS_URL, API_URL, FRIENDS_URL, USERS_URL} from "../util/path.js";

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

// friends -------------------------------------

async function updateButton() {
    let friendshipButton = document.getElementById("friendship-button");

    let status = await getStatus(localStorage.getItem("userId"), userIdOfThisPage);

    console.log(status);

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
    alert("User '" + userIdOfThisPage + "' not found, redirecting to home page...");
    window.location.replace(BASE_URL);
}

function getStatus(myId, userId) {
    return fetch(BASE_URL + API_URL + FRIENDS_URL + 'friendshipStatus' + "/" + userId, {
        method: 'get', headers: {
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


function addFriend(userIdOfThisPage) {
    return fetch(BASE_URL + API_URL + FRIENDS_URL + "add/" + userIdOfThisPage, {
        method: 'post', headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error while calling API (button) " + response.status)
        }
        console.log("Friend request sent");
        return response.text();
    }).then((data) => {
        return data;
    }).catch(error => {
        console.log(error);
    });
}

function acceptFriend(userIdOfThisPage) {
    return fetch(BASE_URL + API_URL + FRIENDS_URL + "accept/" + userIdOfThisPage, {
        method: 'post', headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error while calling API (button) " + response.status)
        }
        console.log("Friend request sent");
        return response.text();
    }).then((data) => {
        return data;
    }).catch(error => {
        console.log(error);
    });
}

function cancelRequest(userIdOfThisPage) {
    return fetch(BASE_URL + API_URL + FRIENDS_URL + 'removeRequest' + "/" + userIdOfThisPage, {
        method: 'delete', headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error while calling API (button) " + response.status)
        }
        console.log("cancel request");
        return response.text();
    }).then((data) => {
        return data;
    }).catch(error => {
        console.log(error);
    });
}

function removeFriend(userIdOfThisPage) {
    return fetch(BASE_URL + API_URL + FRIENDS_URL + 'removeFriend' + "/" + userIdOfThisPage, {
        method: 'delete', headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error while calling API (button) " + response.status)
        }
        console.log("friend removed");
        return response.text();
    }).then((data) => {
        return data;
    }).catch(error => {
        console.log(error);
    });
}