import {isTokenValid} from "../jwtParser.js";
import {BASE_URL, LOGIN_URL} from "../../path.js";

window.onload = () => {
    let token = localStorage.getItem("token");
    if (token === null || !isTokenValid(token) || !isURLCorrect()) {
        window.location.href = BASE_URL + LOGIN_URL
    }
}

// it either ends with a '/' or it has a '?' in the url to be valid because we use the auto search for index.html pages
// forgetting the '/' will result in a not findable js scripts and css files
function isURLCorrect() {
    if (window.location.href.slice(-1) === "/") {
        return true
    }
    return window.location.href.indexOf("?") !== -1;
}