import {isTokenValid} from "../jwtParser.js";
import {HOME_URL, LOGIN_URL} from "../path.js";
import {BASE_URL} from "../frontPath.js";

window.onload = () => {
    let token = localStorage.getItem("token");
    if (window.location.href.slice(-1) !== "/"){
        window.location.href = BASE_URL + LOGIN_URL;
    }
    if (token !== null && isTokenValid(token)) {
        window.location.href = BASE_URL + HOME_URL;
    }
}
