import {endGamePopUp} from "./endGamePopUp.js";
import {BASE_URL} from "../../../util/frontPath.js";

function drawPopUp() {
    endGamePopUp("Egalité !", BASE_URL + "/images/draw.png")
}

export { drawPopUp };
