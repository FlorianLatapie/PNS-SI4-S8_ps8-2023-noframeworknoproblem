import notificationdb from "../../database/notificationdb.js";
import {sendResponse} from "../util.js";


// TODO : need to secure this API
function notificationsApi(urlPathArray, userIdEmitTheRequest, response, paramsObject) {
    switch (urlPathArray[3]) {
        case "get":
            if (paramsObject.numberNotificationsToSkip
                && paramsObject.numberNotificationsToGet
                && !isNaN(parseInt(paramsObject.numberNotificationsToSkip))
                && !isNaN(parseInt(paramsObject.numberNotificationsToGet))) {

                let numberNotificationsToSkip = parseInt(paramsObject.numberNotificationsToSkip);
                let numberNotificationsToGet = parseInt(paramsObject.numberNotificationsToGet);
                getNotifications(userIdEmitTheRequest, numberNotificationsToSkip, numberNotificationsToGet, response);
            }
            break;
        case "delete":
            let notificationId = urlPathArray[4];
            deleteNotification(userIdEmitTheRequest, notificationId, response);
            break;
    }
}

function deleteNotification(userIdEmitTheRequest, notificationId, response) {
    notificationdb.deleteNotification(userIdEmitTheRequest, notificationId).then((result) => {
        sendResponse(response, 200, "Notification deleted");
    }).catch((err) => {
        sendResponse(response, 404, "Notification not deleted : " + err);
    });
}

function addNotification(userIdEmitTheRequest, notification, response) {
    notificationdb.addNotification(userIdEmitTheRequest, notification).then((result) => {
        sendResponse(response, 200, "Notification added");
    }).catch((err) => {
        sendResponse(response, 404, "Notification not added : " + err);
    });
}

function getNotifications(userIdEmitTheRequest, numberNotificationsToSkip, numberNotificationsToGet, response) {
    notificationdb.getNotifications(userIdEmitTheRequest, numberNotificationsToGet, numberNotificationsToSkip).then((result) => {
        sendResponse(response, 200, result);
    }).catch((err) => {
        sendResponse(response, 404, "Notifications not found : " + err);
    });
}

export {notificationsApi};
