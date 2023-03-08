import {sendResponse} from "../util.js";
import jwt from "jsonwebtoken";
import {JWTSecretCode} from "../../credentials/credentials.js";
import achievementdb from "../../database/achievementdb.js";

export function addAchievements(request, response, data) {
    let token = data.token;
    try {
        jwt.verify(token, JWTSecretCode)
    } catch (err) {
        sendResponse(response, 401, "No token provided");
        return;
    }

    let achievementId = data.achievementId;
    let userId = jwt.decode(token).userId;
    achievementdb.addAchievement(achievementId, userId).then((achievementAdded) => {
        console.log("Achievement added: ", achievementAdded);
        sendResponse(response, 201, "OK");
    }).catch((err) => {
        sendResponse(response, 409, "Achievement not added: " + JSON.stringify(err));
    });
}