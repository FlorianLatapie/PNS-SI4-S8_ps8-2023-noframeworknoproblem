"use strict";

import {API_URL, BASE_URL, FRIENDS_URL} from "../path.js";
//import { io } from "/socket.io/socket.io-client.js";
const chatSocket = io("/api/chat", {auth: {token: localStorage.getItem("token")}});

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
  </div>
  <div class="chat">
    <div class="contact bar">
      <div class="name" id="friendSelected">
      </div>
    </div>
    <div class="messages" id="chat">
      <div class="message sender">
      </div>
      <div class="message receiver">
      </div>
    </div>
    <form class="input">
      <input placeholder="Type your message here!" type="text" class="message-input"/>
      <button type="submit">
        <i class="send-button">Envoyer</i>
    </form>
  </div>
</div>

</body>
</html>

    `;

class Chat extends HTMLElement {
    #userId;
    #friends;
    #LastMessage;
    #friendSelected;

    constructor(userId) {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(chatTemplate.content.cloneNode(true));
        this.#userId = userId;

    }

    async connectedCallback() {
        this.shadowRoot.querySelector("#chat").scrollTop = this.shadowRoot.querySelector("#chat").scrollHeight;
        this.#addSocketEvent();
        let contacts = this.shadowRoot.querySelector(".contacts");
        this.#friends = fetch(BASE_URL + API_URL + FRIENDS_URL + 'getFriends' + "/" + this.#userId, {
            method: 'get', headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            if (!response.ok) {
                throw new Error("Error while calling API (button) " + response.status)
            }
            return response.json();
        }).then((data) => {
            return data;
        }).catch(error => {
            console.log(error);
        });
        this.#friends = await this.#friends;
        for (let i = 0; i < this.#friends.length; i++) {
            let contact = document.createElement("div");
            let name = document.createElement("div");
            let message = document.createElement("div");
            contact.classList.add("contact");
            name.classList.add("name");
            message.classList.add("message");
            name.innerHTML = this.#friends[i].username;
            chatSocket.emit("getLastMessage", this.#friends[i].id, this.#userId);
            if (this.#LastMessage === undefined)
                this.#LastMessage = "No message";
            message.innerHTML = this.#LastMessage;
            let fragment = document.createDocumentFragment();
            fragment.appendChild(name.cloneNode(true));
            fragment.appendChild(message.cloneNode(true));
            contact.appendChild(fragment);
            contacts.appendChild(contact.cloneNode(true));
        }
        this.#friendSelected = this.#friends[0];
        let name = this.shadowRoot.querySelector("#friendSelected");
        name.innerHTML = this.#friendSelected.username;
        this.#addEventSubmit();

    }

    #addSocketEvent() {
        chatSocket.on("getLastMessageFromBack", (message) => {
            this.#LastMessage = message;
        });
    }

    #addEventSubmit() {
        let submitForm = this.shadowRoot.querySelector(".input");
        let submitButton = this.shadowRoot.querySelector(".send-button");
        submitButton.addEventListener("click", (e) => {
            e.preventDefault();
            if (submitForm.querySelector(".message-input").value !== "") {
                let message = submitForm.querySelector(".message-input").value;
                chatSocket.emit("sendMessage", message, this.#userId, this.#friendSelected.id);
                submitForm.querySelector(".message-input").value = "";
            }
        });
        submitForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (submitForm.querySelector(".message-input").value !== "") {
                let message = submitForm.querySelector(".message-input").value;
                chatSocket.emit("sendMessage", message, this.#userId, this.#friendSelected.id);
                submitForm.querySelector(".message-input").value = "";
            }
        });
    }

}

window.customElements.define('chat-global', Chat)


