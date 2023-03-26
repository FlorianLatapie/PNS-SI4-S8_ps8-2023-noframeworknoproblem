import {isTokenValid} from "../jwtParser.js";
import {BASE_URL, LOGIN_URL} from "../../path.js";

window.onload = () => {
    let token = localStorage.getItem("token");
    if (token === null || !isTokenValid(token) || !isURLCorrect()) {
        window.location.href = BASE_URL + LOGIN_URL
    }
}

// The URL is considered valid if it ends with a '/' or a '?' because we use automatic search for 'index.html' pages
// Forgetting to include '/' can result in JS and CSS files not being found
function isURLCorrect() {
    if (window.location.href.slice(-1) === "/") {
        return true;
    }
    if (window.location.href.indexOf("?") !== -1){
        return true;
    }
    alert("URL is not correct, please add a '/' at the end of the url :\n" + window.location.href + "\n\nRedirecting to login page...");
    return false;
}