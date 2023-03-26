"use strict";

import {BASE_URL, HOME_URL} from "../../path.js";

function createUserPreviewDiv(userObj) {
    const container = document.createElement('div');
    const img = document.createElement('img');
    const usernameContainer = document.createElement('p');

    // TODO change the link to redirect to the user page
    container.addEventListener("click", () => {
        window.location.replace(BASE_URL + HOME_URL)
    })

    container.classList.add("flex-row", "user-profile");
    img.classList.add("profile-picture");

    img.src = "../images/user-solid.svg";
    img.alt = "Image de profil de l'utilisateur.";

    usernameContainer.innerHTML = userObj.username;
    usernameContainer.id = userObj.userId;

    const fragment = document.createDocumentFragment();
    fragment.appendChild(img);
    fragment.appendChild(usernameContainer);

    container.appendChild(fragment);
    return container;
}

export {createUserPreviewDiv};
