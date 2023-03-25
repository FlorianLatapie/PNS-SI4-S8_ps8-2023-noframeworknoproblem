import userdb from "../database/userdb.js";
import connectedPlayer from "./ConnectedPlayer.js";
import notificationdb from "../database/notificationdb.js";

class SendNotifications {

    static #sendNotification = (receiverId, notification) => {
        SendNotifications.#sendNotificationToSocketPlayer(receiverId, notification);
        SendNotifications.#addNotificationToDatabase(receiverId, notification);
    }

    static #sendNotificationToSocketPlayer = (receiverId, notification) => {
        if (connectedPlayer.isPlayerConnected(receiverId)) {
            connectedPlayer.sendToPlayer(receiverId, "notificationReceived", notification);
        }
    }

    static #addNotificationToDatabase = (receiverId, notification) => {
        notificationdb.addNotification(receiverId, notification).then(r => {});
    }

    // ----------------------------------------- FRIEND REQUEST ----------------------------------------------
    static sendNotificationFriendRequestReceived(receiverId, userId, username) {
        let action = new Action("post", `friends/accept/${userId}`, {});
        let notification = new Notification(`Demande d'ami reçue par ${username}`, action);
        SendNotifications.#sendNotification(receiverId, notification);
    }

    static sendNotificationFriendRequestAccepted(receiverId, username) {
        let action = null;
        let notification = new Notification(`Demande d'ami acceptée par ${username}`, action);
        SendNotifications.#sendNotification(receiverId, notification);
    }

    static sendNotificationFriendRequestRefused(receiverId, username) {
        let action = null;
        let notification = new Notification(`Demande d'ami refusée par ${username}`, action);
        SendNotifications.#sendNotification(receiverId, notification);
    }

    static sendNotificationFriendRemoved(receiverId, username) {
        let action = null;
        let notification = new Notification(`Vous n'êtes plus ami avec ${username}`, action);
        SendNotifications.#sendNotification(receiverId, notification);
    }
}

export default SendNotifications;
