import {isTokenValid} from "../jwtParser.js";

window.onload = () => {
    let token = localStorage.getItem("token");
    if (token !== null && isTokenValid(token)) {
        window.location.href = window.location.protocol + "//" + window.location.host + "/home/";
    }
}
