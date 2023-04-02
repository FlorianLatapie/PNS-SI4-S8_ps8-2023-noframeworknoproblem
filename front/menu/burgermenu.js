"use strict";

import {HOME_URL, PROFILE_URL, FRIENDS_URL, SEARCH_USERS_URL, LOGIN_URL, NOTIFICATIONS_PAGE_URL} from "../util/path.js";
import {BASE_URL} from "../util/frontPath.js";

const house = BASE_URL + "/menu/images/house-solid.svg";
const profile = BASE_URL + "/menu/images/user-solid.svg";
const notifications = BASE_URL + "/menu/images/bell-solid.svg";
const friends = BASE_URL + "/menu/images/user-group-solid.svg";
const addFriend = BASE_URL + "/menu/images/user-plus-solid.svg";
const logout = BASE_URL + "/menu/images/right-from-bracket-solid.svg";
const chat = BASE_URL + "/menu/images/chat-icon.svg";

const iconWidth = "36";

const burgerMenuTemplate = document.createElement("template");

burgerMenuTemplate.innerHTML = `
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
    <a class="nav-link" href=` + BASE_URL + NOTIFICATIONS_PAGE_URL + `>
        <img alt="Notifications" src=` + notifications + `><button>Notifications</button>
    </a>
    <a class="nav-link" href=` + BASE_URL + FRIENDS_URL + `>
        <img alt="Amis" src=` + friends + `><button>Mes amis</button>
    </a>
    <a class="nav-link" href=` + BASE_URL + SEARCH_USERS_URL + `>
        <img alt="Ajouter un ami" src=` + addFriend + `><button>Ajouter un ami</button>
    </a>
    <a class="nav-link" id="chat">
        <img alt="chat" src=` + chat + `><button>Chat</button>
    </a>
    <a class="nav-link" id="logout" href="` + BASE_URL + LOGIN_URL + `">
        <img alt="Se déconnecter" src=` + logout + `><button>Se déconnecter</button>
    </a>
    </ul>
</nav>
`;
export default burgerMenuTemplate;

class Burgermenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(burgerMenuTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        const hamburger = this.shadowRoot.querySelector(".hamburger");
        const navBar = this.shadowRoot.querySelector(".nav-bar");
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navBar.classList.toggle("active");

            let navButtons = this.shadowRoot.querySelectorAll("button");
            if (hamburger.classList.contains("active")) {
                navButtons.forEach(button => button.style.display = "block");
            } else {
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

        let chat = this.shadowRoot.getElementById("chat");
        chat.style.cursor = "pointer";
        chat.addEventListener("click", () => {
            let chatGlobal = document.getElementsByTagName("chat-global");
            chatGlobal[0].style.visibility === "hidden" ? chatGlobal[0].style.visibility = "visible" : chatGlobal[0].style.visibility = "hidden";
        });
    }
}

window.customElements.define('burger-menu', Burgermenu);
