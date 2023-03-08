import {API_URL, BASE_URL, LOGIN_URL, SIGNUP_URL} from "../path.js";

class KonamiCode {
    constructor(debug = false) {
        this.debug = debug;
        this.code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a", "Enter"];
        this.positionInKonamiCode = 0;
    }

    checkKey(e) {
        if (e.key === this.code[this.positionInKonamiCode]) {
            this.positionInKonamiCode++;

            if (this.debug)
                console.log(this.positionInKonamiCode, this.code[this.positionInKonamiCode]);

            if (this.positionInKonamiCode === this.code.length) {
                this.positionInKonamiCode = 0;
                alert("You found the easter egg !")

                fetch(BASE_URL + API_URL + "achievements", {
                    method: "post", headers: {
                        'Accept': 'application/json', 'Content-Type': 'application/json'
                    }, body: JSON.stringify({token: localStorage.getItem("token"), achievement: "konami"})
                }).then((response) => {
                    console.log(response);
                    if (response.status === 201) {
                        window.location.replace(BASE_URL + LOGIN_URL);
                    }
                });
            }
        } else {
            this.positionInKonamiCode = 0;
        }
    }
}

export {KonamiCode};