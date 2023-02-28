"use strict";

const url = window.location.protocol+ "//" + window.location.host;
const house = url + "/menu/images/house-solid.svg";
const bell = url + "/menu/images/bell-solid.svg";
const user = url + "/menu/images/user-group-solid.svg";
const gamepad = url + "/menu/images/gamepad-solid.svg";
const logout = url + "/menu/images/right-from-bracket-solid.svg";

const home = url + "/home/index.html";
const logoutPage = url + "/login/index.html";

const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" href="`+url+`/menu/burgermenu.css">
        <nav class="nav-bar top-corner-content">
            <div class="hamburger">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
            <div id="nav-background"></div>
            <ul class="nav-menu">
                <li><a class="nav-link" href=`+home+`><img alt="Accueil" src=`+house+` width="36"></a></li>
                <li><a class="nav-link" href="#"><img alt="Notifications" src=`+bell+` width="36"></a></li>
                <li><a class="nav-link" href="#"><img alt="Amis" src=`+user+` width="36"></a></li>
                <li><a class="nav-link" href="#"><img alt="Jouer" src=`+gamepad+` width="36"></a>
                </li>
                <li><a class="nav-link" id="logout" href=`+logoutPage+`><img alt="Se déconnecter" src=`+logout+` width="36"></a></li>
            </ul>
        </nav>
`;

class BurgerMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        const hamburger = this.shadowRoot.querySelector(".hamburger");
        const navMenu = this.shadowRoot.querySelector(".nav-menu");
        const navBar = this.shadowRoot.querySelector(".nav-bar");
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
            navBar.classList.toggle("active");
        });

        this.shadowRoot.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
            navBar.classList.remove("active");
        }));

        this.shadowRoot.getElementById("logout").addEventListener("click", () => {
            localStorage.clear();
        });

    }
}

window.customElements.define('burger-menu', BurgerMenu);
