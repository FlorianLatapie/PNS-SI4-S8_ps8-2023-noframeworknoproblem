import userdb from "../../database/userdb.js";
import {authorizeRequest, PARAMS, sendResponse, USER_ID} from "../utilsApi.js";

function usersApiGet(request, response, urlPathArray) {
    if (!authorizeRequest(request, response)) {
        return;
    }

    let userIdEmitTheRequest = request[USER_ID];
    let paramsObject = request[PARAMS]

    switch (urlPathArray[0]) {
        case "get":
            getUser(userIdEmitTheRequest, response, paramsObject);
            break;
        default:
            console.log("URL", urlPathArray, "not supported");
            sendResponse(response, 404, "URL " + request.url + " not supported");

    }
}

function getUser(userIdEmitTheRequest, response, paramsObject) {
    if (paramsObject.name === undefined) {
        sendResponse(response, 404, "Malformed request : name is undefined");
        return;
    }

    userdb.getUsersByNameRegex(paramsObject.name).then((users) => {
        sendResponse(response, 200, JSON.stringify(users));
    }).catch((err) => {
        sendResponse(response, 404, "Malformed request : " + err);
    });
}

export {usersApiGet};
