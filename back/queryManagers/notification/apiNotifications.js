import notificationdb from "../../database/notificationdb.js";
import {checkAuthorization, PARAMS, sendResponse, urlNotFound, USER_ID} from "../utilsApi.js";
import SchemaValidator from "../../util/SchemaValidator.js";


// TODO : need to secure this API
function notificationsApiGet(request, response, urlPathArray) {
    if (!checkAuthorization(request, response)) {
        return;
    }

    let userIdEmitTheRequest = request[USER_ID];
    let paramsObject = request[PARAMS];

    const schemaGetQuery = {
        type: "object",
        properties: {
            numberNotificationsToSkip: {"type": "string"},
            numberNotificationsToGet: {"type": "string"}
        },
        required: ["numberNotificationsToSkip", "numberNotificationsToGet"]
    }
    switch (urlPathArray[0]) {
        case "get":
            let schemaValidator = new SchemaValidator();
            let validationFunction = schemaValidator.compile(schemaGetQuery);
            let paramsObject = request[PARAMS];

            if (!validationFunction(paramsObject)) {
                sendResponse(response, 400, "Bad request : Query is not valid");
                return;
            }


            if (!(checkStringIsPositiveInteger(paramsObject.numberNotificationsToSkip)
                && checkStringIsPositiveInteger(paramsObject.numberNotificationsToGet))) {
                sendResponse(response, 400, "Bad request : the value in the query are not positive integer");
            }

            let numberNotificationsToSkip = parseInt(paramsObject.numberNotificationsToSkip);
            let numberNotificationsToGet = parseInt(paramsObject.numberNotificationsToGet);

            getNotifications(userIdEmitTheRequest, numberNotificationsToSkip, numberNotificationsToGet, response);
            break;
        case "delete":
            let notificationId = urlPathArray[1];
            deleteNotification(userIdEmitTheRequest, notificationId, response);
            break;
        default:
            urlNotFound(request, response)
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

function checkStringIsPositiveInteger(string) {
    let number = parseInt(string);
    return !isNaN(number) && number >= 0;
}

export {notificationsApiGet};
