import gamedb from "../database/gamedb.js";

export default class GameEngineDBUtil {
    static saveGameEngineDB(gameEngineToSave) {
        // save the object to the database
        let data = {
            gameId: gameEngineToSave.id,
            player1: gameEngineToSave.player1.id,
            player2: gameEngineToSave.player2.id,
            gameEngine: gameEngineToSave
        }

        gamedb.addGame(data).then(function (result) {
            console.log("The game was saved to the database ! ");
        }).catch(function (error) {
            console.log("error while saving the game to the database");
            console.log(error);
        });
    }

    static removeGameEngineFromDB(id) {
        gamedb.removeGame(id).then(function (result) {
            console.log("The game was removed from the database");
        }).catch(function (error) {
            console.log("error while removing the game from the database");
            console.log(error);
        });
    }
}
