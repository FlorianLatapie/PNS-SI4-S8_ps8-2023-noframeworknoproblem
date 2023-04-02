import userstatsdb from "../database/userstatsdb.js";

function updateElo(winnerId, loserId) {
    console.log("updating elo");
    let winnerElo = 0;
    let loserElo = 0;
    userstatsdb.getStatsForUser(winnerId).then(function (result) {
        winnerElo = result.elo;
    }).catch(function (error) {
        console.log("error while retrieving the user stats");
        console.log(error);
    });
    userstatsdb.getStatsForUser(loserId).then(function (result) {
        loserElo = result.elo;
    }).catch(function (error) {
        console.log("error while retrieving the user stats");
        console.log(error);
    });
    let winnerExpected = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    let loserExpected = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));
    winnerElo = winnerElo + 50 * (1 - winnerExpected);
    loserElo = loserElo + 50 * (0 - loserExpected);
    userstatsdb.updateElo(winnerId, winnerElo).then(r => {
        console.log("updated elo for winner");
    }).catch(e => {
        console.log("error while updating elo for winner");
        console.log(e);
    });
    userstatsdb.updateElo(loserId, loserElo).then(r => {
        console.log("updated elo for loser");
    }).catch(e => {
        console.log("error while updating elo for loser");
        console.log(e);
    });
}

export default updateElo;
