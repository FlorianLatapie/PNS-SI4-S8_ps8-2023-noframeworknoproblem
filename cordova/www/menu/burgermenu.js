"use strict";

import {
    HOME_URL,
    PROFILE_URL,
    FRIENDS_URL,
    SEARCH_USERS_URL,
    LOGIN_URL,
    NOTIFICATIONS_PAGE_URL,
    RANKING_URL,
    OTHER_MENU_URL
} from "../util/path.js";
import {BASE_URL_PAGE} from "../util/frontPath.js";
// import {playSoundMessageReceived} from "../templates/cordana/soundTypes.js";

const house = BASE_URL_PAGE + "menu/images/house-solid.svg";
const profile = BASE_URL_PAGE + "menu/images/user-solid.svg";
const notifications = BASE_URL_PAGE + "menu/images/bell-solid.svg";
const friends = BASE_URL_PAGE + "menu/images/user-group-solid.svg";
const addFriend = BASE_URL_PAGE + "menu/images/user-plus-solid.svg";
const logout = BASE_URL_PAGE + "menu/images/right-from-bracket-solid.svg";
const ranking = BASE_URL_PAGE + "menu/images/ranking-star-solid.svg";
const chat = BASE_URL_PAGE + "menu/images/chat-icon.svg";
const other = BASE_URL_PAGE + "menu/images/plus-solid.svg";


const iconWidth = "36";

const burgerMenuTemplate = document.createElement("template");

burgerMenuTemplate.innerHTML = `
<link rel="stylesheet" href="${BASE_URL_PAGE}menu/burgermenu.css">
<script src="/cordova.js"></script>

<nav class="nav-bar top-corner-content">
    <a class="nav-link" id="accueil" href="${BASE_URL_PAGE}${HOME_URL}">
        <img alt="Accueil" src="${house}"><button>Accueil</button>
    </a>
    <a class="nav-link" id="profile" href="${BASE_URL_PAGE}${PROFILE_URL}">
        <img alt="Profil" src="${profile}"><button>Profil</button>
    </a>
    <a class="nav-link" id="notifications" href="${BASE_URL_PAGE}${NOTIFICATIONS_PAGE_URL}" >
        <img alt="Notifications" src="${notifications}"><button>Notifications</button>
    </a>
    <a class="nav-link" id="friends" href="${BASE_URL_PAGE}${FRIENDS_URL}">
        <img alt="Amis" src="${friends}"><button>Mes amis</button>
    </a>
    <a class="nav-link" id="addFriends" href="${BASE_URL_PAGE}${SEARCH_USERS_URL}" >
        <img alt="Ajouter un ami" src="${addFriend}"><button>Ajouter un ami</button>
    </a>
    <a class="nav-link" id="chat">
        <img alt="chat" src="${chat}"><button>Chat</button>
    </a>
    <a class="nav-link" id="other" href="${BASE_URL_PAGE}${OTHER_MENU_URL}" >
        <img alt="Autres" src="${other}"><button>Autres</button>
    </a>
    <a class="nav-link" id="ranking" href="${BASE_URL_PAGE}${RANKING_URL}">
        <img alt="Classement" src="${ranking}"><button>Classement</button>
    <a class="nav-link" id="logout" href="${BASE_URL_PAGE}${LOGIN_URL}">
        <img alt="Se déconnecter" src="${logout}"><button>Se déconnecter</button>
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
        this.shadowRoot.getElementById("logout").addEventListener("click", () => {
            localStorage.clear();
        });

        let chat = this.shadowRoot.getElementById("chat");
        chat.style.cursor = "pointer";
        chat.addEventListener("click", () => {
            let chatGlobal = document.getElementsByTagName("chat-global");
            chatGlobal[0].style.display === "none" || chatGlobal[0].style.display === "" ? chatGlobal[0].style.display = "block" : chatGlobal[0].style.display = "none";
        });
    }
}

window.customElements.define('burger-menu', Burgermenu);
