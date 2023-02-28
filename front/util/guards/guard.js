import {isTokenValid} from "../jwtParser.js";
import {BASE_URL, LOGIN_URL} from "../../path.js";

window.onload = () => {
    let token = localStorage.getItem("token");
    if (token === null || !isTokenValid(token)) {
        window.location.href = BASE_URL + LOGIN_URL
    }
}
