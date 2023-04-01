"use strict";

import {API_URL, NOTIFICATIONS_API_URL} from "../../util/path.js";
import {BASE_URL} from "../../util/frontPath.js";
import {validationPopUp} from "../popUp/validationPopUp/validationPopUp.js";


function createNotificationRepresentation(notificationInDB) {
    const container = document.createElement('div');
    const messageContainer = document.createElement('div');
    const message = document.createElement('p');
    const actionButton = document.createElement('img');
    const deleteButton = document.createElement('img');

    let notification = notificationInDB.notification;

    container.classList.add("flex-row", "notification-container");
    messageContainer.classList.add("flex-row", "message-container");
    messageContainer.id = notificationInDB.notificationId;


    deleteButton.src = "../images/trash-solid.svg";
    deleteButton.alt = "Supprimer la notification";

    actionButton.src = "../images/check-solid.svg";
    actionButton.alt = "Valider l'action de la notification";

    deleteButton.addEventListener("click", () => {
        deleteNotificationWithValidation(container, messageContainer.id);
    });

    actionButton.addEventListener("click", () => {
        deleteNotificationWithValidation(container, messageContainer.id);
    });

    if (notification.action) {
        actionButton.addEventListener("click", () => {
            fetch(BASE_URL + API_URL + notification.action.url, {
                method: notification.action.method,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: (notification.action.body) ? JSON.stringify(notification.action.body) : {}

            }).then((response) => {
                if (!response.ok) {
                    console.log("Error while retrieving notifications", response.status)
                    // There is an error
                }
                console.log(response.text());
                messageContainer.remove();
            }).catch(error => {
                console.log(error);
            })
        })
    }

    if (notification.link) {
        actionButton.addEventListener("click", () => {
            window.location.replace(BASE_URL + notification.link);
        })
    }


    message.innerHTML = notification.message;
    messageContainer.appendChild(message);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(messageContainer);
    if (notification.action || notification.link) {
        fragment.appendChild(actionButton);
    }
    fragment.appendChild(deleteButton);
    container.appendChild(fragment);

    return container;
}

function deleteNotification(container, notificationId) {
    fetch(BASE_URL + API_URL + NOTIFICATIONS_API_URL + "delete/" + notificationId, {
        method: "delete", headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        console.log("Get a response ", response.status);
        if (!response.ok) {
            console.log("Error while deleting notifications", response.status, response.text())
            // There is an error
        }
        console.log(response.text());
        container.remove();
    }).catch(error => {
        console.log(error);
    });
}

function deleteNotificationWithValidation(container, notificationId) {
    validationPopUp(() => deleteNotification(container, notificationId), "Voulez-vous supprimer cette notification ?");
}

export {createNotificationRepresentation};
