import {createNotificationRepresentation} from "../templates/notificationInList/NotificationRepresentationInList.js";
import {API_URL, NOTIFICATIONS_API_URL} from "../util/path.js";
import {BASE_URL} from "../util/frontPath.js";

let container = document.getElementById("notifications-container")
const DEFAULT_NUMBER_NOTIFICATIONS_TO_GET = 10;

const permanentSocket = io("/api/permanent", {auth: {token: localStorage.getItem("token")}});

window.window.addEventListener('load', function () {
    fetch(BASE_URL + API_URL + NOTIFICATIONS_API_URL + "get?"
        + `numberNotificationsToGet=${DEFAULT_NUMBER_NOTIFICATIONS_TO_GET}&numberNotificationsToSkip=0`, {
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
    }).then(data => data.forEach(notificationInDB => {
        // Add a user case on the web page
        console.log("Notification received from HTTP", notificationInDB);

        // Notifications are received from the most recent to the oldest
        // We want to display them from the more recent at the top to the oldest at the bottom
        container.appendChild(createNotificationRepresentation(notificationInDB));
    }));
});

permanentSocket.on("connect", () => {
    console.log("Socket connected");

    permanentSocket.on("notificationReceived", (notification) => {
        console.log("Notification received from Socket", notification);

        // We want to display the notification at the top because it is the most recent
        container.insertBefore(createNotificationRepresentation(notification), container.firstChild);
    });
});
