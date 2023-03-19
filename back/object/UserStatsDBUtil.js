import AchievementsDBUtil from "./AchievementsDBUtil.js";
import userstatsdb from "../database/userstatsdb.js";

export function STATSaddGamePlayed(userId) {
    let gamesPlayed = -1000;

    userstatsdb.getStatsForUser(userId).then(function (result) {
        console.log("get stats for the user : ", result);
        console.log("gamesPlayed = ", result.gamesPlayed)
        gamesPlayed = result.gamesPlayed;

        if (isNaN(gamesPlayed) || gamesPlayed === undefined || gamesPlayed === null || gamesPlayed === -1000) {
            gamesPlayed = 0;
        }
        gamesPlayed++;
        console.log("gamesPlayed after incrementation  = ", gamesPlayed);

        userstatsdb.addStats(userId, {gamesPlayed: gamesPlayed}).then(function (result) {
            console.log("The stats were saved to the database ! you have played ", gamesPlayed, " games");
        }).catch(function (error) {
            console.log("error while saving the stats to the database");
            console.log(error);
        });

        AchievementsDBUtil.updateAchievements(userId);
    });



}