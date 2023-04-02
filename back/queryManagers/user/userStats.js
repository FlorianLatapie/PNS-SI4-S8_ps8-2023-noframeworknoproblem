import {authorizeRequest, PARAMS, sendResponse, USER_ID} from "../utilsApi.js";
import userstatsdb from "../../database/userstatsdb.js";
import {getAllUsersByElo} from "../../object/UserEloDBUtil.js";

function userStatsGet(request, response, urlPathArray) {
    if (!authorizeRequest(request, response)) {
        return;
    }

    let requesterUserId = request[USER_ID];
    let paramsObject = request[PARAMS]

    switch (urlPathArray[0]) {
        case "getAll":
            getAllStatsForUser(response, urlPathArray[1]);
            break;
        case "getAllElo":
            getAllUsersByEloRequest(response);
            break;
        default:
            console.log("URL", urlPathArray, "not supported");
            sendResponse(response, 404, "URL " + request.url + " not supported");
    }
}

function getAllStatsForUser(response, userId) {
    userstatsdb.getStatsForUser(userId + "").then((stats) => {
        sendResponse(response, 200, JSON.stringify(stats));
    }).catch((error) => {
        console.log("error while getting the stats for user", userId);
        console.log(error);
        sendResponse(response, 500, "error while getting the stats for user " + userId);
    });
}

function getAllUsersByEloRequest(response) {
    getAllUsersByElo().then((users) => {
        sendResponse(response, 200, JSON.stringify(users));
    }).catch((error) => {
        console.log("error while getting all users by elo");
        console.log(error);
        sendResponse(response, 500, "error while getting all users by elo");
    });
}

export {userStatsGet};
