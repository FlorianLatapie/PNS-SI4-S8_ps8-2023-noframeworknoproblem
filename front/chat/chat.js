"use strict";

import {BASE_URL} from "../path.js";

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
<!-- partial:index.partial.html -->
<div class="center">
  <div class="contacts">
    <i class="fas fa-bars fa-2x"></i>
    <h2>
      Contacts
    </h2>
    <div class="contact">
      <div class="name">
        Steve Rogers
      </div>
      <div class="message">
        That is America's ass 🇺🇸🍑
      </div>
    </div>
    <div class="contact">
      <div class="name">
        Tony Stark
      </div>
      <div class="message">
        Uh, he's from space, he came here to steal a necklace from a wizard.
      </div>
    </div>
    <div class="contact">
      <div class="name">
        Bruce Banner
      </div>
      <div class="message">
        There's an Ant-Man *and* a Spider-Man?
      </div>
    </div>
    <div class="contact">
      <div class="name">
        Thor Odinson
      </div>
      <div class="message">
        I like this one
      </div>
    </div>
    <div class="contact">
      <div class="name">
        Carol Danvers
      </div>
      <div class="message">
        Hey Peter Parker, you got something for me?
      </div>
    </div>
  </div>
  <div class="chat">
    <div class="contact bar">
      <div class="name">
        Tony Stark
      </div>
      <div class="seen">
        Today at 12:56
      </div>
    </div>
    <div class="messages" id="chat">
      <div class="time">
        Today at 11:41
      </div>
      <div class="message parker">
        Hey, man! What's up, Mr Stark? 👋
      </div>
      <div class="message stark">
        Kid, where'd you come from? 
      </div>
      <div class="message parker">
        Field trip! 🤣
      </div>
      <div class="message parker">
        Uh, what is this guy's problem, Mr. Stark? 🤔
      </div>
      <div class="message stark">
        Uh, he's from space, he came here to steal a necklace from a wizard.
      </div>
      <div class="message stark">
        <div class="typing typing-1"></div>
        <div class="typing typing-2"></div>
        <div class="typing typing-3"></div>
      </div>
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
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(chatTemplate.content.cloneNode(true));
    }

}

window.customElements.define('chat-global', Chat)


