"use strict";

const url = "http://" + window.location.host;
const house = url + "/menu/images/house-solid.svg";
const bell = url + "/menu/images/bell-solid.svg";
const user = url + "/menu/images/user-group-solid.svg";
const gamepad = url + "/menu/images/gamepad-solid.svg";
const logout = url + "/menu/images/right-from-bracket-solid.svg";

const home = url + "/home/home.html";
const logoutPage = url + "/login/index.html";

const template = document.createElement("template");
template.innerHTML = `
    <style>
        li {
        list-style-type: none;
        margin-bottom: 10px;
    }
    
    a {
        text-decoration: none;
    }
    
    .nav-bar {
        background-color: white;
    }
    
    .nav-menu {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        top: 9vh;
        transition: 0.3s;
        left: -100%;
        width: 8vw;
        padding: 0;
    }
    
    .nav-link {
        transition: 0.7s ease;
    }
    
    .nav-link:hover {
        color: white;
    }
    
    .nav-item {
        margin: 16px 0;
    }
    
    .hamburger {
        display: block;
        cursor: pointer;
        margin-top: 20px;
    }
    
    .bar {
        display: block;
        width: 35px;
        height: 5px;
        margin: 6px auto;
        -webkit-transition: all 0.3s ease-in-out;
        transition: all 0.3s ease-in-out;
        background-color: black;
    }
    
    .hamburger.active .bar:nth-child(1) {
        transform: translateY(11px) rotate(45deg);
    }
    
    .hamburger.active .bar:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active .bar:nth-child(3) {
        transform: translateY(-11px) rotate(-45deg);
    }
    
    .nav-menu.active {
        left: 0;
    }
    
    .nav-bar {
        background-color: white;
        height: 100vh;
    }
    
    .nav-bar.active {
        background-color: #f5f5f5;
    }
    </style>
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
