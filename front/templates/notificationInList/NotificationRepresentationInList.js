"use strict";

import {API_URL, BASE_URL, HOME_URL} from "../../path.js";

function createNotificationRepresentation(notificationInDB) {
    const container = document.createElement('div');
    const usernameContainer = document.createElement('p');

    // TODO to change later, put the action on button instead of click on the whole div
    let notification = notificationInDB.notification;
    if (notification.action !== null && notification.action !== undefined) {
        container.addEventListener("click", () => {
            fetch(BASE_URL + notification.action.url, {
                method: notification.action.method, headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                if (!response.ok) {
                    console.log("Error while retrieving notifications", response.status)
                    // There is an error
                }
                return response.json()
            }).then(data => {
                console.log(data);
            });
        })
    }

    container.classList.add("flex-row", "notification-profile");
    container.id = notificationInDB.notificationId;

    // TODO : add the possibility to delete a notification

    usernameContainer.innerHTML = notification.message;

    const fragment = document.createDocumentFragment();
    fragment.appendChild(usernameContainer);
    container.appendChild(fragment);
    return container;
}

export {createNotificationRepresentation};
