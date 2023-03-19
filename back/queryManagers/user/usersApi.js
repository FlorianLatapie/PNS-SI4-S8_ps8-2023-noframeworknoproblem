import userdb from "../../database/userdb.js";
import {sendResponse} from "../util.js";

function usersApi(urlPath, userIdEmitTheRequest, response, paramsObject) {
    if (urlPath.length < 4) {
        throw new Error("URL " + urlPath + " not supported");
    }

    switch (urlPath[3]) {
        case "get":
            getUser(userIdEmitTheRequest, response, paramsObject);
            break;
    }

    throw new Error("URL " + urlPath + " not supported");
}

function getUser(userIdEmitTheRequest, response, paramsObject) {
    userdb.getUsersByNameRegex(paramsObject.name).then((users) => {
        sendResponse(response, 200, JSON.stringify(users));
    }).catch((err) => {
        sendResponse(response, 404, "Malformed request : " + err);
    });
}

export {usersApi};
