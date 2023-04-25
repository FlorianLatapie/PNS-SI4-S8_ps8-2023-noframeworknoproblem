import {PLAY_AI_ORDER_URL, PLAY_LOCAL_URL, PLAY_MATCHMAKING_URL} from "../util/path.js";
import {KonamiCode} from "../EasterEggs/konami.js";
import {BASE_URL_PAGE} from "../util/frontPath.js";

const konami = new KonamiCode(true);
document.addEventListener("keydown", (e) => {
        konami.checkKey(e);
    }
);

document.getElementById("play-ai").addEventListener("click", () => {
    window.location.href = BASE_URL_PAGE + PLAY_AI_ORDER_URL;
});

document.getElementById("play-local").addEventListener("click", () => {
    window.location.href = BASE_URL_PAGE + PLAY_LOCAL_URL;
});

document.getElementById("play-matchmaking").addEventListener("click", () => {
    window.location.href = BASE_URL_PAGE + PLAY_MATCHMAKING_URL;
});
