"use strict";

import {API_URL, CHATS_API_URL, FRIENDS_URL} from "../util/path.js";
import {BASE_URL} from "../util/frontPath.js";

// do not import io, it is imported from the HTML file.
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
    </div>
    <form class="input">
      <input placeholder="Ecris ton message ici !" type="text" class="message-input"/>
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
    #messagesToGet;
    #messagesToSkip;
    #chat;
/*
    #scrollTop;
*/

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(chatTemplate.content.cloneNode(true));
        this.#userId = localStorage.getItem("userId");
        this.#messagesToGet = 10;
        this.#messagesToSkip = 0;
        this.#LastMessage = "No message";
        this.#chat = this.shadowRoot.querySelector("#chat");
    }

    async connectedCallback() {
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
            //let message = document.createElement("div");
            contact.classList.add("contact");
            name.classList.add("name");
            //message.classList.add("message");
            // querySelector method uses CSS3 selectors for querying the DOM and CSS3 doesn't support ID selectors that start with a digit:
            /*
                        message.id = "a" + this.#friends[i].userId;
            */
            name.innerHTML = this.#friends[i].username;
            chatSocket.emit("getLastMessageForProfile", this.#userId, this.#friends[i].userId);
            //message.innerHTML = this.#LastMessage;
            let fragment = document.createDocumentFragment();
            fragment.appendChild(name.cloneNode(true));
            //fragment.appendChild(message.cloneNode(true));
            contact.appendChild(fragment);
            contacts.appendChild(contact.cloneNode(true));
            this.#addFriendSelector();
        }
        this.#friendSelected = this.#friends[0];
        let name = this.shadowRoot.querySelector("#friendSelected");
        name.innerHTML = this.#friendSelected.username;
        this.#addEventSubmit();
        chatSocket.emit("init", this.#userId, this.#friendSelected.userId);
        this.#getMessagesFromBack();
        this.#chat.addEventListener("scroll", () => {
            if (this.#chat.scrollTop <= 0) {
                this.#getMessagesFromBack();
            }
        });
    }

    #addSocketEvent() {
        /*chatSocket.on("getLastMessageFromBack", (message, user2) => {
            if (message.length !== 0) {
                let id = "#a" + user2;
                let messageDiv = this.shadowRoot.querySelector(id);
                messageDiv.innerHTML = "Dernier message : " + message[0].message;
            }
        });*/
        chatSocket.on('messageAddedInDb', () => {
            chatSocket.emit("updateChat", this.#userId, this.#friendSelected.userId);

        });
        chatSocket.on('updateChatFromBack', (message) => {
            let messageToAdd = document.createElement("div");
            messageToAdd.classList.add("message");
            if (message[0].idSender === this.#userId) {
                messageToAdd.classList.add("sender");
            } else {
                messageToAdd.classList.add("receiver");
            }
            console.log(message[0].message);
            messageToAdd.innerHTML = message[0].message;
            this.#chat.append(messageToAdd);
            this.#chat.scrollTop = this.#chat.scrollHeight;
            //chatSocket.emit("getLastMessageForProfile", this.#userId, this.#friendSelected.userId);
        });
    }

    #addFriendSelector() {
        let contacts = this.shadowRoot.querySelector(".contacts");
        let contact = contacts.lastChild;
        contact.addEventListener("click", (e) => {
            e.preventDefault();
            chatSocket.emit('leaveRoom');
            this.#friendSelected = this.#friends.find(friend => friend.username === contact.childNodes[0].textContent);
            let name = this.shadowRoot.querySelector("#friendSelected");
            chatSocket.emit('read', this.#friendSelected.userId, this.#userId);
            name.innerHTML = this.#friendSelected.username;
            this.#messagesToSkip = 0;
            chatSocket.emit("init", this.#userId, this.#friendSelected.userId);
            this.#chat.innerHTML = "";
            this.#getMessagesFromBack();
        });
    }


    #addEventSubmit() {
        let submitForm = this.shadowRoot.querySelector(".input");
        let submitButton = this.shadowRoot.querySelector(".send-button");
        submitButton.addEventListener("click", (event) => {
            event.preventDefault();
            if (submitForm.querySelector(".message-input").value !== "") {
                let message = submitForm.querySelector(".message-input").value;
                chatSocket.emit("sendMessage", message, this.#userId, this.#friendSelected.userId);
                submitForm.querySelector(".message-input").value = "";
                this.#messagesToSkip = 0;
            }
        });
        submitForm.addEventListener("submit", (event) => {
            event.preventDefault();
            if (submitForm.querySelector(".message-input").value !== "") {
                let message = submitForm.querySelector(".message-input").value;
                chatSocket.emit("sendMessage", message, this.#userId, this.#friendSelected.userId);
                submitForm.querySelector(".message-input").value = "";
                this.#messagesToSkip = 0;
            }
        });
    }

    #getMessagesFromBack() {
        fetch(BASE_URL + API_URL + CHATS_API_URL + "get?"
            + `friendId=${this.#friendSelected.userId}&numberMessagesToGet=${this.#messagesToGet}&numberMessagesToSkip=${this.#messagesToSkip}`, {
            method: "get", headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            if (!response.ok) {
                console.log("Error while retrieving messages from back", response.status);
            }
            return response.json();
        }).then(data => {
                data.forEach(messageInDB => {
                    let messageDiv = document.createElement("div");
                    messageDiv.classList.add("message");
                    if (messageInDB.idSender === this.#userId) {
                        messageDiv.classList.add("sender");
                    } else {
                        messageDiv.classList.add("receiver");
                    }
                    messageDiv.innerHTML = messageInDB.message;
                    this.#chat.prepend(messageDiv);
                })
                console.log("scrollTop : " + this.#chat.scrollTop);
                if (this.#messagesToSkip === 0) this.#chat.scrollTop = this.#chat.scrollHeight;
                else this.#chat.scrollTop = this.#chat.scrollHeight - this.#chat.scrollTop;
                /*this.#scrollTop = this.#chat.scrollTop;*/
                this.#messagesToSkip += data.length;
            }
        )
    }

}

window.customElements.define('chat-global', Chat)


