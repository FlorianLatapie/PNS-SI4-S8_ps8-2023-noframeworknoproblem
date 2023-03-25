import notificationdb from "../../database/notificationdb.js";
import {checkAuthorization, PARAMS, sendResponse, USER_ID} from "../utilsApi.js";


// TODO : need to secure this API
function notificationsApiGet(request, response, urlPathArray) {
    if (!checkAuthorization(request, response)) {
        return;
    }

    let userIdEmitTheRequest = request[USER_ID];
    let paramsObject = request[PARAMS];

    // TODO : modify because it's shit
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

function notificationsApiPost(request, response, urlPathArray) {

}

function notificationsApiPut(request, response, urlPathArray) {

}

function notificationsApiDelete(request, response, urlPathArray) {

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

export {notificationsApiGet};
