"use strict";

import {PROFILE_URL} from "./path.js";
import {BASE_URL} from "./frontPath.js";

let username = document.getElementById("username");
username.innerText = localStorage.getItem("username");
username.addEventListener("click", () => {
    window.location.replace(BASE_URL + PROFILE_URL);
});
