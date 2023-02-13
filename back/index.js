// The http module contains methods to handle http queries.
import * as http from 'http';
import * as crypto from "crypto";

// Let's import our logic.
import * as fileQuery from './queryManagers/front.js'
import * as apiQuery from './queryManagers/api.js'
import gamedb from "./database/gamedb.js";
import {Server} from "socket.io";
import Player from "../front/GameLogic/Player.js";
import GameEngine from "../front/GameLogic/GameEngine.js";
import computeMove from "./logic/ai.js";
import jwt from "jsonwebtoken";
import Grid from "../front/GameLogic/Grid.js";
import GridChecker from "../front/GameLogic/GridChecker.js";
import {displayACatchedError} from "./util/util.js";

// Servers setup -------------------------------------------------------------------------------------------------------

/* The http module contains a createServer function, which takes one argument, which is the function that
** will be called whenever a new request arrives to the server.
 */
let httpServer = http.createServer(function (request, response) {
    // First, let's check the URL to see if it's a REST request or a file request.
    // We will remove all cases of "../" in the url for security purposes.

    let filePath = request.url.split("/").filter(function (elem) {
        return elem !== "..";
    });

    try {
        // If the URL starts by /api, then it's a REST request (you can change that if you want).
        if (filePath[1] === "api") {
            apiQuery.manage(request, response);
            // If it doesn't start by /api, then it's a request for a file.
        } else {
            fileQuery.manage(request, response);
            // error while processing /: TypeError: fileQuery.manage is not a function

        }
    } catch (error) {
        displayACatchedError(error,`error while processing ${request.url}:`)
    }
// For the server to be listening to request, it needs a port, which is set thanks to the listen function.
}).listen(8000);

// SetUp of the webSocket server.

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH"],
        allowedHeaders: "*",
        credentials: true
    }
});

// Methods -------------------------------------------------------------------------------------------------------------
let saveGameEngineToFSAndDB = function (gameEngineToSave) {
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
        displayACatchedError(error,"error while saving the game to the database");
    });

}

let removeGameEngineFromDB = function (id) {
    gamedb.removeGame(id).then(function (result) {
        console.log("The game was removed from the database");
    }).catch(function (error) {
        displayACatchedError(error,"error while removing the game from the database");
    });
}

let playerPlay = function (player, gameEngine, column, row) {
    let gameState = gameEngine.playTurn(player, column, row);
    let sentBoard = {
        board: gameEngine.grid.cells
    }
    gameSocket.emit("updatedBoard", sentBoard)

    if (gameState.isFinished === true) {
        removeGameEngineFromDB(gameEngine.id)
        gameSocket.emit("gameIsOver", gameState.winner)
    } else {
        saveGameEngineToFSAndDB(gameEngine, "./back/savedGames/" + gameEngine.id + ".json")
    }

}
let AIPlay = function (AIPlayer, gameEngine) {
    let globalCoordinatesAI = computeMove(gameEngine); // computeMove from ai.js : [column, row]
    let column = globalCoordinatesAI[0];
    let row = globalCoordinatesAI[1];

    if (column === undefined || row === undefined) {
        throw new Error("AI plays undefined: column " + column + " row " + row)
    }

    playerPlay(AIPlayer, gameEngine, column, row)
}

let humanPlay = function (HumanPlayer, gameEngine, globalCoordinates) {
    let column = globalCoordinates[0];
    let row = globalCoordinates[1];

    playerPlay(HumanPlayer, gameEngine, column, row)
}

// main ----------------------------------------------------------------------------------------------------------------
const gameSocket = io.of("/api/game")
let gameEngine;

// middle ware ---------------------------------------------------------------------------------------------------------
gameSocket.use((socket, next) => {
    let token = socket.handshake.auth.token;
    if (token) {
        // verify the token
        jwt.verify(token, "secretCode", (err, decoded) => {
            if (err) {
                console.log("error while verifying the token")
                console.log(err);
                return next(new Error("Authentication error"));
            }
            socket.username = decoded.username;
            socket.userId = decoded.userId;
        });
        next();
    } else {
        next(new Error("Authentication error"));
    }
});

// Connection ----------------------------------------------------------------------------------------------------------
gameSocket.on('connection', (socket) => {
    console.log("-------------------------------------")
    console.log('Socket connected: id = ' + socket.id + ' username = ' + socket.username + ' userId = ' + socket.userId);

    let userId = socket.userId;

    let AIPlayer = new Player("AI", userId + "-AI")
    let HumanPlayer = new Player("HumanPlayer", userId)

    // Setup ----------------------------------------------------------------------------------------------------------
    socket.on("setup", setupObject => {
        console.log("setup", setupObject);
        // search for a game engine in the db
        gamedb.getGamePlayerId(userId).then(function (result) {
            if (result !== null) {
                console.log("game found in the database")
                // load the game engine from the file system
                let gameEngineFromDB = result.gameEngine;

                if (gameEngineFromDB.player1.id === userId) {
                    gameEngine = new GameEngine(HumanPlayer, AIPlayer, gameEngineFromDB.id);
                    for (let i = 0; i < gameEngineFromDB.turns.length; i++) {
                        if (i % 2 === 0) {
                            gameEngine.playTurn(HumanPlayer, gameEngineFromDB.turns[i])
                            let sentBoard = {
                                board: gameEngine.grid.cells
                            }
                            gameSocket.emit("updatedBoard", sentBoard)
                        } else {
                            gameEngine.playTurn(AIPlayer, gameEngineFromDB.turns[i])
                            let sentBoard = {
                                board: gameEngine.grid.cells
                            }
                            gameSocket.emit("updatedBoard", sentBoard)
                        }
                    }
                    console.log(gameEngine.grid.toString())
                } else {
                    gameEngine = new GameEngine(AIPlayer, HumanPlayer, gameEngineFromDB.id);
                    console.log(gameEngine.grid.toString())
                }
            }
            else {
                console.log("game engine not found in the database, creating a new game ...")

                // game engine not found : create a new one
                if (setupObject.AIplays !== 1 && setupObject.AIplays !== 2) {
                    gameSocket.emit("errorSetUp", new Error("Invalid setup"))
                }

                let uuid = crypto.randomBytes(16).toString("hex");
                if (setupObject.AIplays === 1) {
                    gameEngine = new GameEngine(AIPlayer, HumanPlayer, uuid);
                    AIPlay(AIPlayer, gameEngine);
                } else {
                    gameEngine = new GameEngine(HumanPlayer, AIPlayer, uuid);
                }
            }
        }).catch(function (error) {
            displayACatchedError(error,"error while searching for a game engine in the database");
        });
    });

    // newMove ---------------------------------------------------------------------------------------------------------
    socket.on("newMove", (globalCoordinates) => {
        console.log("newMove", globalCoordinates);
        try {
            humanPlay(HumanPlayer, gameEngine, globalCoordinates);
            if (!gameEngine.isGameOver) {
                AIPlay(AIPlayer, gameEngine);
            }
        } catch (e) {
            console.log(e);
            console.log("playError : " + e.message + " error for player : " + gameEngine.currentPlayingPlayer.name)
            gameSocket.emit("playError", e.message + " error for player : " + gameEngine.currentPlayingPlayer.name)
        }
    })

    // disconnect ------------------------------------------------------------------------------------------------------
    socket.on('disconnect', () => {
        console.log('user ' + socket.id + ' disconnected');
    });
});
