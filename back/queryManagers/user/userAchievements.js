"use strict";

import {BODY, checkAuthorization, sendResponse, USER_ID} from "../utilsApi.js";
import jwt from "jsonwebtoken";
import {JWTSecretCode} from "../../credentials/credentials.js";
import achievementdb from "../../database/achievementdb.js";

export function achievementsManager(request, response, urlPathArray) {
    if (!authorizeRequest(request, response)) {
        return;
    }

    switch (urlPathArray[0]) {
        case "add":
            addAchievements(request, response);
            break;
        case "getAll":
            getAllAchievements(request, response);
            break;
        case "getAllPossible":
            getAllPossibleAchievements(request, response);
            break;
        default:
            console.log("URL", request.url, "not supported");
            sendResponse(response, 404, "URL " + request.url + " not supported");
            break;
    }
}

function authorizeRequest(request, response) {
    if (!checkAuthorization(request)) {
        sendResponse(response, 401, "Unauthorized");
        return false;
    }
    console.log("authorized for request", request.url)
    return true;
}



function addAchievements(request, response) {
    let data = request[BODY];
    let token = data.token;

    let achievement = data.achievement;
    let userId = jwt.decode(token).userId;
    achievementdb.addAchievement(userId, achievement).then((achievementAdded) => {
        console.log("Achievement added: ", achievementAdded);
        sendResponse(response, 201, "OK");
    }).catch((err) => {
        sendResponse(response, 409, "Achievement not added: " + JSON.stringify(err));
    });
}

function getAllAchievements(request, response) {
    let userId = request[USER_ID];

    achievementdb.getAchievementsForUser(userId).then((achievements) => {
        sendResponse(response, 200, JSON.stringify(achievements));
    }).catch((err) => {
        console.log("Error: ", err);
        sendResponse(response, 409, "Achievements not found: " + JSON.stringify(err));
    });
}

function getAllPossibleAchievements(request, response) {
   sendResponse(response, 200, JSON.stringify(achievementdb.getAllPossibleAchievements()));
}