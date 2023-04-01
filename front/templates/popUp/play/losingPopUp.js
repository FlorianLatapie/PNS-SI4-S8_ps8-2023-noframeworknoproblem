import {BASE_URL} from "../../../util/frontPath.js";
import {endGamePopUp} from "./endGamePopUp.js";

function losingPopUp() {
    endGamePopUp("Tu as perdu !", BASE_URL + "/images/lose.png")
}

export { losingPopUp };
