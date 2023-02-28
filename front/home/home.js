import {BASE_URL, PLAY_AI_ORDER_URL, PLAY_LOCAL_URL} from "../path.js";

document.getElementById("play-ai")
    .setAttribute("href",
        BASE_URL + PLAY_AI_ORDER_URL);

document.getElementById("play-local")
    .setAttribute("href",
        BASE_URL + PLAY_LOCAL_URL);
