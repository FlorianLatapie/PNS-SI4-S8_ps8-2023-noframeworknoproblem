"use strict";

import {ACHIEVEMENTS_URL, API_URL} from "../util/path.js";
import {BASE_URL} from "../util/frontPath.js";

class KonamiCode {
    constructor(showHints = false) {
        this.debug = showHints;
        this.code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a", "Enter"];
        this.positionInKonamiCode = 0;
    }

    checkKey(e) {
        if (e.key === this.code[this.positionInKonamiCode]) {
            this.positionInKonamiCode++;

            if (this.debug) console.log(this.positionInKonamiCode, this.code[this.positionInKonamiCode]);

            if (this.positionInKonamiCode === this.code.length) {
                this.positionInKonamiCode = 0;
                alert("Bravo tu as fait le Konami Code !")

                fetch(BASE_URL + API_URL + ACHIEVEMENTS_URL + "add/", {
                    method: "post", headers: {
                        'Accept': 'application/json', 'Content-Type': 'application/json'
                    }, body: JSON.stringify({token: localStorage.getItem("token"), achievement: "konami"})
                }).then((response) => {
                    console.log("konami success unlocked");
                });
            }
        } else {
            this.positionInKonamiCode = 0;
        }
    }
}

export {KonamiCode};