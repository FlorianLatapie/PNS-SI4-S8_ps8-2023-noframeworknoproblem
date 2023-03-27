"use strict";

import AchievementsDBUtil from "./AchievementsDBUtil.js";
import userstatsdb from "../database/userstatsdb.js";

export function STATSaddGamePlayed(userId) {
    let gamesPlayed = -Infinity;

    userstatsdb.getStatsForUser(userId).then(function (result) {
        gamesPlayed = result.gamesPlayed;

        if (!Number.isFinite(gamesPlayed)) {
            gamesPlayed = 0;
        }

        gamesPlayed++;

        userstatsdb.addStats(userId, {gamesPlayed: gamesPlayed}).then(function (result) {
            console.log("The stats were saved to the database ! you have played ", gamesPlayed, " games");
            AchievementsDBUtil.updateAchievements(userId);
        }).catch(function (error) {
            console.log("error while saving the stats to the database");
            console.log(error);
        });
    });
}