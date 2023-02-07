// The http module contains methods to handle http queries.
import * as http from 'http';
// Let's import our logic.
//const fileQuery = require('./queryManagers/front.js')
import * as fileQuery from './queryManagers/front.js'
import * as apiQuery from './queryManagers/api.js'
//const apiQuery = import('./queryManagers/api.js')

/* The http module contains a createServer function, which takes one argument, which is the function that
** will be called whenever a new request arrives to the server.
 */
let httpServer = http.createServer(function (request, response) {
    // First, let's check the URL to see if it's a REST request or a file request.
    // We will remove all cases of "../" in the url for security purposes.
    let filePath = request.url.split("/").filter(function(elem) {
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
    } catch(error) {
        console.log(`error while processing ${request.url}: ${error}`)
        response.statusCode = 400;
        response.end(`Something in your request (${request.url}) is strange...`);
    }
// For the server to be listening to request, it needs a port, which is set thanks to the listen function.
}).listen(8000);

// SetUp of the webSocket server.

//const { Server } = require("socket.io");
// convert this require to an import
import { Server } from "socket.io";
import Player from "../front/GameLogic/Player.js";
import GameEngine from "../front/GameLogic/GameEngine.js";
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

let IAPlay = function(IAPlayer, gameEngine) {
    let globalCoordinatesIA = computeMove(gameEngine.grid);
    let gameState = gameEngine.playTurn(IAPlayer, globalCoordinatesIA[0], globalCoordinatesIA[1])
    gameSocket.emit("updatedBoard", gameEngine.grid)

    if (gameState.isFinished === true) {
        gameSocket.emit("gameIsOver", gameState.winner)
    }
}

const gameSocket = io.of("/api/game")
gameSocket.on('connection', (socket) => {
    console.log('a user connected');
    let setUpIA = {AIplays: 2}
    let IAPlayer = new Player("IA", 0)
    let HumanPlayer = new Player("HumanPlayer", socket.id)
    let gameEngine;

    gameSocket.on("setup", obj => {
        if (obj.AIplays !== 1 || obj.AIplays !== 2) {
            gameSocket.emit("errorSetUp", new Error("Invalid setup"))
        }

        if (obj.AIplays === 1) {
            gameEngine = new GameEngine(IAPlayer, HumanPlayer);
            IAPlay(IAPlayer, gameEngine);

        } else {
            gameEngine = new GameEngine(HumanPlayer, IAPlayer);
        }
    })

    gameSocket.on("newMove", (globalCoordinates) => {
        try {
            let gameState = gameEngine.playTurn(HumanPlayer, globalCoordinates[0], globalCoordinates[1])
            gameSocket.emit("updatedBoard", gameEngine.grid)
            if (gameState.isFinished === true) {
                gameSocket.emit("gameIsOver", gameState.winner)
            }
            IAPlay(IAPlayer, gameEngine);
        } catch (e) {
            gameSocket.emit("playError", e)
        }
    })

    gameSocket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
