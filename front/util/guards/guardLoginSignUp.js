import {isTokenValid} from "../jwtParser.js";
import {BASE_URL, HOME_URL} from "../../path.js";

window.onload = () => {
    let token = localStorage.getItem("token");
    if (token !== null && isTokenValid(token)) {
        window.location.href = BASE_URL + HOME_URL;
    }
}
