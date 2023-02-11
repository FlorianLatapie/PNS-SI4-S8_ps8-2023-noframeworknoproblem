// The http module contains methods to handle http queries.
import * as http from 'http';
import * as fs from 'fs';
import * as crypto from "crypto";

// Let's import our logic.
import * as fileQuery from './queryManagers/front.js'
import * as apiQuery from './queryManagers/api.js'
import userdb from "./database/userdb.js";
import {Server} from "socket.io";
import Player from "../front/GameLogic/Player.js";
import GameEngine from "../front/GameLogic/GameEngine.js";
import computeMove from "./logic/ai.js";

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
        console.log(`error while processing ${request.url}: ${error}`)
        response.statusCode = 400;
        response.end(`Something in your request (${request.url}) is strange...`);
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
let saveToFS = function (object, path) {
    // save the raw object to a file
    fs.writeFile(path, JSON.stringify(object), function (err) {
        if (err) {
            console.log(err);
        }
    });
    console.log("The file was saved to:" + path);
}

let removeFromFS = function (path) {
    fs.unlink(path, function (err) {
        if (err) {
            console.log(err);
        }
    });
    console.log("The file was removed from:" + path);
}

let playerPlay = function (player, gameEngine, column, row) {
    let gameState = gameEngine.playTurn(player, column, row);
    let sentBoard = {
        board: gameEngine.grid.cells
    }
    gameSocket.emit("updatedBoard", sentBoard)

    saveToFS(gameEngine, "./back/savedGames/"+gameEngine.id+".json")

    if (gameState.isFinished === true) {
        removeFromFS("./back/savedGames/"+gameEngine.id+".json")
        gameSocket.emit("gameIsOver", gameState.winner)
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

let humanPlay = function (HumanPlayer, gameEngine, globalCoordinates){
    let column = globalCoordinates[0];
    let row = globalCoordinates[1];

    playerPlay(HumanPlayer, gameEngine, column, row)
}

// DB methods ----------------------------------------------------------------------------------------------------------
let addUser = async function (user) {
    await userdb.addUser(user);
}

// main ----------------------------------------------------------------------------------------------------------------
const gameSocket = io.of("/api/game")
let gameEngine;

// Connection ----------------------------------------------------------------------------------------------------------
gameSocket.on('connection', (socket) => {
    console.log('user ' + socket.id + ' connected');
    let AIPlayer = new Player("AI", socket.id+"-AI")
    let HumanPlayer = new Player("HumanPlayer", socket.id)

    // Setup ----------------------------------------------------------------------------------------------------------
    socket.on("setup", setupObject => {
        console.log("setup", setupObject);
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
    });

    // newMove ---------------------------------------------------------------------------------------------------------
    socket.on("newMove", (globalCoordinates) => {
        console.log("newMove", globalCoordinates);
        try {
            humanPlay(HumanPlayer, gameEngine, globalCoordinates);
            AIPlay(AIPlayer, gameEngine);
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
