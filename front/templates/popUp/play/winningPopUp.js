import {BASE_URL} from "../../../util/frontPath.js";
import {endGamePopUp} from "./endGamePopUp.js";

function winningPopUp() {
    endGamePopUp("Tu as gagné !", BASE_URL + "/images/win.png")
}

export { winningPopUp };
