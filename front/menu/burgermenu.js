"use strict";

import {HOME_URL, BASE_URL, PROFILE_URL, LOGIN_URL} from "../path.js";

const house = BASE_URL + "/menu/images/house-solid.svg";
const profile = BASE_URL + "/menu/images/user-solid.svg";
const notifications = BASE_URL + "/menu/images/bell-solid.svg";
const friends = BASE_URL + "/menu/images/user-group-solid.svg";
const backToCurrentGame = BASE_URL + "/menu/images/gamepad-solid.svg";
const logout = BASE_URL + "/menu/images/right-from-bracket-solid.svg";

const iconWidth = "36";

const bugerMenuTemplate = document.createElement("template");

bugerMenuTemplate.innerHTML = `
<link rel="stylesheet" href="` + BASE_URL + `/menu/burgermenu.css">
<nav class="nav-bar top-corner-content">
    <a>
        <div class="hamburger">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
        </div>
   </a> 
    <a class="nav-link" href=` + BASE_URL + HOME_URL + `>
        <img alt="Accueil" src=` + house + `><button>Accueil</button>
    </a>
    <a class="nav-link" href=` + BASE_URL + PROFILE_URL + `>
        <img alt="Profil" src=` + profile + `><button>Profil</button>
    </a>
    <a class="nav-link" href=` + BASE_URL + HOME_URL + `>
        <img alt="Notifications" src=` + notifications + `><button>Notifications</button>
    </a>
    <a class="nav-link" href=` + BASE_URL + HOME_URL + `>
        <img alt="Amis" src=` + friends + `><button>Amis</button>
    </a>
    <a class="nav-link" id="logout" href="` + BASE_URL + LOGIN_URL + `">
        <img alt="Se déconnecter" src=` + logout + `><button>Se déconnecter</button>
    </a>
    </ul>
</nav>
`;
export default bugerMenuTemplate;

class Burgermenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(bugerMenuTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        const hamburger = this.shadowRoot.querySelector(".hamburger");
        const navBar = this.shadowRoot.querySelector(".nav-bar");
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navBar.classList.toggle("active");

            let navButtons = this.shadowRoot.querySelectorAll("button");
            if (hamburger.classList.contains("active")) {
                console.log("active");
                navButtons.forEach(button => button.style.display = "block");
            } else {
                console.log("not active");
                navButtons.forEach(button => button.style.display = "none");
            }
        });




        this.shadowRoot
            .querySelectorAll(".nav-link")
            .forEach(n => n.addEventListener("click", () => {
                hamburger.classList.remove("active");
                navBar.classList.remove("active");
            }));

        this.shadowRoot.getElementById("logout").addEventListener("click", () => {
            localStorage.clear();
        });
    }
}

window.customElements.define('burger-menu', Burgermenu);
