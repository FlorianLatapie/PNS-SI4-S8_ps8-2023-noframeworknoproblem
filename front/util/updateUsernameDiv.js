"use strict";

import {BASE_URL, PROFILE_URL} from "../path.js";

let username = document.getElementById("username");
username.innerHTML = localStorage.getItem("username");
username.addEventListener("click", () => {
    window.location.replace(BASE_URL + PROFILE_URL);
});
