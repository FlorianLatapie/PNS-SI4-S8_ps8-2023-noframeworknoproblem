"use strict";

import {BASE_URL} from "../path.js";
import frienddb from "../../back/database/frienddb.js";
import chatdb from "../../back/database/chatdb.js";

const chatTemplate = document.createElement("template");

chatTemplate.innerHTML = `
<link rel="stylesheet" href="` + BASE_URL + `/chat/chat.css">

    <!DOCTYPE html>
<html lang="fr" >
<head>
  <meta charset="UTF-8">
  <title>Chat</title>

</head>
<body>
<div class="center">
  <div class="contacts">
    <i class="fas fa-bars fa-2x"></i>
    <h2>
      Contacts
    </h2>
    <div class="contact">
      <div class="name">
      </div>
      <div class="message">
      </div>
    </div>
  </div>
  <div class="chat">
    <div class="contact bar">
      <div class="name">
        Tony Stark
      </div>
      <div class="seen">
      </div>
    </div>
    <div class="messages" id="chat">
      <div class="message parker">
      </div>
      <div class="message stark">
      </div>
      <div class="message parker">
      </div>
      <div class="message parker">
      </div>
      <div class="message stark">
      </div>
<!--      <div class="message stark">
        <div class="typing typing-1"></div>
        <div class="typing typing-2"></div>
        <div class="typing typing-3"></div>
      </div>-->
    </div>
    <div class="input">
      <i class="fas fa-camera"></i><i class="far fa-laugh-beam"></i><input placeholder="Type your message here!" type="text" /><i class="fas fa-microphone"></i>
    </div>
  </div>
</div>

</body>
</html>

    `;

class Chat extends HTMLElement {
    #userId;
    #friends;

    constructor(userId) {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(chatTemplate.content.cloneNode(true));
        this.#userId = userId;

    }

    async connectedCallback() {
        //this.shadowRoot.querySelector("#chat").scrollTop = this.shadowRoot.querySelector("#chat").scrollHeight;
        let contacts = this.shadowRoot.querySelector(".contacts");
        let contact = document.createElement("div");
        let name = document.createElement("div");
        let message = document.createElement("div");
        contact.classList.add("contact");
        name.classList.add("name");
        message.classList.add("message");
        this.#friends = await frienddb.getFriends(this.#friends);
        for(let i = 0; i < this.#friends.length; i++){
            name.innerHTML = this.#friends[i].name;
            message.innerHTML = await chatdb.getLastReceivedMessage(this.#friends[i].id, this.#userId);
            let fragment = document.createDocumentFragment();
            fragment.appendChild(name.cloneNode(true));
            fragment.appendChild(message.cloneNode(true));
            contact.appendChild(fragment);
            contacts.appendChild(contact.cloneNode(true));
        }
    }

}

window.customElements.define('chat-global', Chat)


