import userdb from "../../database/userdb.js";
import {authorizeRequest, PARAMS, sendResponse, USER_ID} from "../utilsApi.js";
import gamedb from "../../database/gamedb.js";

function usersApiGet(request, response, urlPathArray) {
    if (!authorizeRequest(request, response)) {
        return;
    }

    let requesterUserId = request[USER_ID];
    let paramsObject = request[PARAMS]

    switch (urlPathArray[0]) {
        case "getCurrentAIGame":
            getCurrentAIGame(response, requesterUserId);
            break;
        case "getName":
            getUser(requesterUserId, response, paramsObject);
            break;
        case "get":
            if (urlPathArray[1] === undefined) {
                sendResponse(response, 404, "Malformed request : userId is undefined");
                return;
            }
            getUserById(response, urlPathArray[1]);
            break;
        default:
            console.log("URL", urlPathArray, "not supported");
            sendResponse(response, 404, "URL " + request.url + " not supported");
    }
}

function getUser(userId, response, paramsObject) {
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

function getUserById(response, userId) {
    userdb.getUserById(userId).then((user) => {
        sendResponse(response, 200, JSON.stringify(user));
    }).catch((err) => {
        sendResponse(response, 404, "Malformed request : " + err);
    });
}

function getCurrentAIGame(response, userId) {
    gamedb.getGamePlayerId(userId).then((game) => {
        sendResponse(response, 200, JSON.stringify(game));
    }).catch((err) => {
        sendResponse(response, 404, "Malformed request : " + err);
    });
}

export {usersApiGet};
