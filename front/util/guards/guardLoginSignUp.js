import {isTokenValid} from "../jwtParser.js";
import {HOME_URL} from "../path.js";
import {BASE_URL} from "../frontPath.js";

window.onload = () => {
    let token = localStorage.getItem("token");
    if (token !== null && isTokenValid(token)) {
        window.location.href = BASE_URL + HOME_URL;
    }
}
