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
import {nextMove, setup} from "./logic/aiPerso.js";
import jwt from "jsonwebtoken";
import GameEngineDBUtil from "./object/GameEngineDBUtil.js";
import {displayACatchedError} from "./util/util.js";
import {JWTSecretCode} from "./credentials/credentials.js";

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

// main ----------------------------------------------------------------------------------------------------------------
const gameSocket = io.of("/api/game")
let gameEngine;

// removes all the games from the database when the server starts/restarts
gamedb.removeAllGames().then(() => {
    console.log("Server started, all the games have been removed from the database")
})

function authenthicate(socket, next) {
    let token = socket.handshake.auth.token;
    if (token) {
        jwt.verify(token, JWTSecretCode, (err, decoded) => {
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
}

// middle ware ---------------------------------------------------------------------------------------------------------
gameSocket.use((socket, next) => {
    authenthicate(socket, next);
});

function saveOrDeleteGame(gameState, gameEngine) {
    if (gameState.isFinished === true) {
        GameEngineDBUtil.removeGameEngineFromDB(gameEngine.id)
        gameSocket.emit("gameIsOver", gameState.winner)
    } else {
        GameEngineDBUtil.saveGameEngineToFSAndDB(gameEngine, "./back/savedGames/" + gameEngine.id + ".json")
    }
}

let playerPlay = function (player, gameEngine, column, row) {
    let gameState = gameEngine.playTurn(player, column, row);
    gameSocket.emit("updatedBoard", {board: gameEngine.grid.cells})

    saveOrDeleteGame(gameState, gameEngine);
}
let AIPlay = function (AIPlayer, gameEngine, lastMove) {
    let start = Date.now();
    let globalCoordinatesAI = nextMove(lastMove); // computeMove from ai.js : [column, row]
    console.log("AI computation time: " + (Date.now() - start) + " ms")
    let column = globalCoordinatesAI[0];
    let row = globalCoordinatesAI[1];

    console.log("AI plays: column " + column + " row " + row)

    if (column === undefined || row === undefined) {
        throw new Error("AI plays undefined: column " + column + " row " + row)
    }

    playerPlay(AIPlayer, gameEngine, column, row)
}

let humanPlay = function (HumanPlayer, gameEngine, globalCoordinates) {
    let column = globalCoordinates[0];
    let row = globalCoordinates[1];

    playerPlay(HumanPlayer, gameEngine, column, row);
    return [column, row];
}

function gameSocketOnConnectionInitVariables(socket) {
    console.log("-------------------------------------")
    console.log('Socket connected: id = ' + socket.id + ' username = ' + socket.username + ' userId = ' + socket.userId);

    let userId = socket.userId;

    let AIPlayer = new Player("AI", userId + "-AI")
    let HumanPlayer = new Player("HumanPlayer", userId)
    return {userId, AIPlayer, HumanPlayer};
}

function autoPlay(gameEngineFromDB, HumanPlayer, AIPlayer) {
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
}

function reloadGameFromDB(dbResult, userId, HumanPlayer, AIPlayer) {
    console.log("game found in the database")
    // load the game engine from the file system
    let gameEngineFromDB = dbResult.gameEngine;

    if (gameEngineFromDB.player1.id === userId) {
        gameEngine = new GameEngine(HumanPlayer, AIPlayer, gameEngineFromDB.id);
        autoPlay(gameEngineFromDB, HumanPlayer, AIPlayer);
    } else {
        gameEngine = new GameEngine(AIPlayer, HumanPlayer, gameEngineFromDB.id);
        autoPlay(gameEngineFromDB, AIPlayer, HumanPlayer);
        console.log(gameEngine.grid.toString())
    }
}

function newGame(setupObject, AIPlayer, HumanPlayer) {
    console.log("game engine not found in the database, creating a new game ...")

    // game engine not found : create a new one
    if (setupObject.AIplays !== 1 && setupObject.AIplays !== 2) {
        gameSocket.emit("errorSetUp", new Error("Invalid setup"));
        return;
    }

    let uuid = crypto.randomBytes(16).toString("hex");

    setup(setupObject.AIplays);

    if (setupObject.AIplays === 1) {
        gameEngine = new GameEngine(AIPlayer, HumanPlayer, uuid);
        AIPlay(AIPlayer, gameEngine);
    } else {
        gameEngine = new GameEngine(HumanPlayer, AIPlayer, uuid);
    }
}

function readSetup(setupObject, userId, HumanPlayer, AIPlayer) {
    console.log("setup", setupObject);
    // search for a game engine in the db
    gamedb.getGamePlayerId(userId).then(function (dbResult) {
        if (dbResult !== null) {
            reloadGameFromDB(dbResult, userId, HumanPlayer, AIPlayer);
        } else {
            newGame(setupObject, AIPlayer, HumanPlayer);
        }
    }).catch(function (error) {
        displayACatchedError(error, "error while searching for a game engine in the database");
    });
}

function readNewMove(globalCoordinates, HumanPlayer, AIPlayer) {
    globalCoordinates[0] = parseInt(globalCoordinates[0]);
    globalCoordinates[1] = parseInt(globalCoordinates[1]);

    console.log("newMove", globalCoordinates);
    try {
        let moveHuman = humanPlay(HumanPlayer, gameEngine, globalCoordinates);
        if (!gameEngine.isGameOver) {
            AIPlay(AIPlayer, gameEngine, moveHuman);
        }
    } catch (e) {
        console.log(e);
        console.log("playError : " + e.message + " error for player : " + gameEngine.currentPlayingPlayer.name)
        gameSocket.emit("playError", e.message + " error for player : " + gameEngine.currentPlayingPlayer.name)
    }
    console.log("end of newMove ----------------------------------------------------------------------------------")
}

// Connection ----------------------------------------------------------------------------------------------------------
gameSocket.on('connection', (socket) => {
    let {userId, AIPlayer, HumanPlayer} = gameSocketOnConnectionInitVariables(socket);

    // Setup ----------------------------------------------------------------------------------------------------------
    socket.on("setup", setupObject => {
        readSetup(setupObject, userId, HumanPlayer, AIPlayer);
    });

    // newMove ---------------------------------------------------------------------------------------------------------
    socket.on("newMove", (globalCoordinates) => {
        readNewMove(globalCoordinates, HumanPlayer, AIPlayer);
    })

    // disconnect ------------------------------------------------------------------------------------------------------
    socket.on('disconnect', () => {
        console.log('user ' + socket.id + ' disconnected');
    });
    socket.on("giveUp", () => {
        socket.emit("gameIsOver", gameEngine.getOtherPlayer().name);
        console.log("AI wins")
    })
});

