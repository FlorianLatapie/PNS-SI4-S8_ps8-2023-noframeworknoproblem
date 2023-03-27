import userstatsdb from "../database/userstatsdb.js";
import achievementdb from "../database/achievementdb.js";

function updateAchievements(userId) {
    userstatsdb.getStatsForUser(userId).then(function (result) {
        if (result.gamesPlayed > 0) {
            achievementdb.addAchievement(userId, "1stGame").then(function (result) {
                console.log("The achievement 'result.stats.gamesPlayed > 0' : '1stGame' was added to the database ! ");
            }).catch(function (error) {
                console.log("error while adding the achievement to the database");
                console.log(error);
            });
        }
        if (result.gamesPlayed >= 10) {
            achievementdb.addAchievement(userId, "10Games").then(function (result) {
                console.log("The achievement 'result.stats.gamesPlayed > 10' : '10Games' was added to the database ! ");
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