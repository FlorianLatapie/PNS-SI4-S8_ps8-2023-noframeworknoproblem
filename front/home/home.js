import {BASE_URL, PLAY_AI_ORDER_URL, PLAY_LOCAL_URL, PLAY_MATCHMAKING_URL} from "../util/path.js";
import {KonamiCode} from "../EasterEggs/konami.js";

const konami = new KonamiCode(true);
document.addEventListener("keydown", (e) => {
        konami.checkKey(e);
    }
);

document.getElementById("play-ai")
    .setAttribute("href",
        BASE_URL + PLAY_AI_ORDER_URL);

document.getElementById("play-local")
    .setAttribute("href",
        BASE_URL + PLAY_LOCAL_URL);

document.getElementById("play-matchmaking")
    .setAttribute("href", BASE_URL + PLAY_MATCHMAKING_URL);
