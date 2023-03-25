"use strict";

import {API_URL, BASE_URL, NOTIFICATIONS_URL} from "../../path.js";

function createNotificationRepresentation(notificationInDB) {
    const container = document.createElement('div');
    const messageContainer = document.createElement('p');
    const actionButton = document.createElement('button');
    const deleteButton = document.createElement('button');

    // TODO to change later, put the action on button instead of click on the whole div
    let notification = notificationInDB.notification;

    container.classList.add("flex-row", "notification-profile");
    container.id = notificationInDB.notificationId;


    // TODO : change by image
    deleteButton.innerHTML = "Supprimer";
    actionButton.innerHTML = "Activer";

    deleteButton.addEventListener("click", () => {
        fetch(BASE_URL + API_URL + NOTIFICATIONS_URL + "delete/" + container.id, {
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
    });


    // TODO : generalize to handle to put a body into the request
    if (notification.action !== null && notification.action !== undefined) {
        actionButton.addEventListener("click", () => {
            fetch(BASE_URL + API_URL + notification.action.url, {
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
                console.log(response.text());
                container.remove();
            }).catch(error => {
                console.log(error);
            })
        })
    }


    messageContainer.innerHTML = notification.message;

    const fragment = document.createDocumentFragment();
    fragment.appendChild(messageContainer);
    if (notification.action !== null && notification.action !== undefined) {
        fragment.appendChild(actionButton);
    }
    fragment.appendChild(deleteButton);

    container.appendChild(fragment);
    return container;
}

export {createNotificationRepresentation};
