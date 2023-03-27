"use strict";

import {BODY, sendResponse} from "../utilsApi.js";
import jwt from "jsonwebtoken";
import {JWTSecretCode} from "../../credentials/credentials.js";
import achievementdb from "../../database/achievementdb.js";

export function achievementsManager(request, response, urlPathArray) {
    switch (urlPathArray[0]) {
        case "add":
            addAchievements(request, response);
            break;
        case "getAll":
            getAllAchievements(request, response);
            break;
        default:
            console.log("URL", request.url, "not supported");
            sendResponse(response, 404, "URL " + request.url + " not supported");
            break;
    }
}

function getAllAchievements(request, response) {
    let data = request[BODY];
    let token = data.token;
    let userId = data.userId;

    try {
        jwt.verify(token, JWTSecretCode)
    } catch (err) {
        sendResponse(response, 401, "No token provided");
        return;
    }

    achievementdb.getAchievementsForUser(userId).then((achievements) => {
        console.log("Achievements: ", achievements);
        sendResponse(response, 200, JSON.stringify(achievements));
    }).catch((err) => {
        console.log("Error: ", err);
        sendResponse(response, 409, "Achievements not found: " + JSON.stringify(err));
    });
}

export function addAchievements(request, response) {
    let data = request[BODY];
    let token = data.token;

    try {
        jwt.verify(token, JWTSecretCode)
    } catch (err) {
        sendResponse(response, 401, "No token provided");
        return;
    }
    let achievement = data.achievement;
    let userId = jwt.decode(token).userId;
    achievementdb.addAchievement(userId, achievement).then((achievementAdded) => {
        console.log("Achievement added: ", achievementAdded);
        sendResponse(response, 201, "OK");
    }).catch((err) => {
        sendResponse(response, 409, "Achievement not added: " + JSON.stringify(err));
    });
}
