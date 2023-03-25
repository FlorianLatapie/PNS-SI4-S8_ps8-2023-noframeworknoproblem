import {createNotificationRepresentation} from "../templates/notificationInList/NotificationRepresentationInList.js";
import {API_URL, BASE_URL, NOTIFICATIONS_URL} from "../path.js";

let container = document.getElementById("notification-center")

window.window.addEventListener('load', function () {
    fetch(BASE_URL + API_URL + NOTIFICATIONS_URL + "get", {
        method: "get", headers: {
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
    }).then(data => data.forEach(notification => {
        // Add a user case on the web page
        container.appendChild(createNotificationRepresentation(notification));
    }));
});
