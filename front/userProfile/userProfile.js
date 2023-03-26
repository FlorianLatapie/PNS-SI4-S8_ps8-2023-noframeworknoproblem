"use strict";

import {BASE_URL} from "../util/path.js";

// Script --------------------------------------------------------------------------------------------------------------

// user id is in the url : http://localhost:8000/userprofile/?userId=XXX
// parse the url to get the id
let url = new URL(window.location.href);
let userId = url.searchParams.get("userId");
let username = userId;

if (!isUserValid(userId)) {
    alert("User '" + userId + "' not found, redirecting to home page...");
    window.location.replace(BASE_URL);
}

let title = document.getElementById("page-title");
title.innerHTML = "Profil de " + username;

let greeting = document.getElementById("greeting");
greeting.innerHTML = "Bienvenue sur la page de " + username + " !";


// Functions -----------------------------------------------------------------------------------------------------------
function isUserValid(userId) {
    return Boolean(userId);
}
