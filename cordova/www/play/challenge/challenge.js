import Grid from "../../GameLogic/Grid.js";
import SocketChallenge from "./SocketChallenge.js";
import {OPPONENT_ID, IS_NEW_CHALLENGE} from "./constantsChallenge.js";
import WebPageInteractionPVP from "../WebPageInteractionPVP.js";

const url = new URL(window.location.href);
let opponent_id = url.searchParams.get(OPPONENT_ID);
let is_new_challenge = url.searchParams.get(IS_NEW_CHALLENGE);

let grid = new Grid(7, 6);
//let gameSocket = io("/api/game", {auth: {token: localStorage.getItem("token")}});

let webPageInteraction = new WebPageInteractionPVP(grid);
let socketMatchmaking = new SocketChallenge(webPageInteraction, grid);
webPageInteraction.setSocket(socketMatchmaking);
launchChallenge();

function checkData() {
    if (!opponent_id) {
        console.log("ERROR : No opponent id found in url", opponent_id);
        return false;
    }

    if (is_new_challenge !== 'true' && is_new_challenge !== 'false') {
        console.log("ERROR : incorrect is_new_challenge found in url", is_new_challenge);
        return false;
    }

    return true;
}

function launchChallenge() {
    if (!checkData()) {
        console.log("ERROR : Data are not valid");
        return;
    }

    // Here the data are valid
    if (is_new_challenge === 'true') {
        socketMatchmaking.newChallenge(opponent_id);
    } else if (is_new_challenge === 'false') {
        socketMatchmaking.acceptChallenge(opponent_id);
    }
}

