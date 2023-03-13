import userstatsdb from "../database/userstatsdb.js";
import achievementdb from "../database/achievementdb.js";

function updateAchievements(userId) {
    console.log("updateAchievements, for userId = ", userId)
    userstatsdb.getStatsForUser(userId).then(function (result) {
        console.log("result for getStatsForUser = ", result);
        if (result.stats.gamesPlayed > 0) {
            achievementdb.addAchievement(userId, "1stGame").then(function (result) {
                console.log("The achievement was added to the database ! ");
            }).catch(function (error) {
                console.log("error while adding the achievement to the database");
                console.log(error);
            });
        }
    }).catch(function (error) {
        console.log("error while retrieving the user stats");
        console.log(error);
    });
}

export default {updateAchievements};