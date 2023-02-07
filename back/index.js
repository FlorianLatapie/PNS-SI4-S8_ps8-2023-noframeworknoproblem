// The http module contains methods to handle http queries.
import * as http from 'http';
// Let's import our logic.
//const fileQuery = require('./queryManagers/front.js')
import * as fileQuery from './queryManagers/front.js'
import * as apiQuery from './queryManagers/api.js'
//const apiQuery = import('./queryManagers/api.js')
import userdb from "./database/userdb.js";
//const { Server } = require("socket.io");
// convert this require to an import
import {Server} from "socket.io";
import Player from "../front/GameLogic/Player.js";
import GameEngine from "../front/GameLogic/GameEngine.js";
import computeMove from "./logic/ai.js";

/* The http module contains a createServer function, which takes one argument, which is the function that
** will be called whenever a new request arrives to the server.
 */
let httpServer = http.createServer(function (request, response) {
    // First, let's check the URL to see if it's a REST request or a file request.
    // We will remove all cases of "../" in the url for security purposes.
    let filePath = request.url.split("/").filter(function (elem) {
        return elem !== "..";
    });

    /*console.log("Salutations");
    (async () => {
        const user = {username:'vinh', password:'1234'};
        await userdb.addUser(user);
        const user2 = await userdb.getUser(user);
        console.log(user2);
    })();*/
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
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

let AIPlay = function (AIPlayer, gameEngine) {
    let globalCoordinatesAI = computeMove(gameEngine);
    let column = globalCoordinatesAI[0];
    let row = globalCoordinatesAI[1];
    let gameState = gameEngine.playTurn(AIPlayer, column, row);
    gameSocket.emit("updatedBoard", gameEngine.grid)

    if (gameState.isFinished === true) {
        gameSocket.emit("gameIsOver", gameState.winner)
    }
}

const gameSocket = io.of("/api/game")
let gameEngine;

gameSocket.on('connection', (socket) => {
    console.log('user ' + socket.id + ' connected');
    let AIPlayer = new Player("AI", 0)
    let HumanPlayer = new Player("HumanPlayer", socket.id)

    socket.on("setup", obj => {
        console.log("setup", obj);
        if (obj.AIplays !== 1 && obj.AIplays !== 2) {
            gameSocket.emit("errorSetUp", new Error("Invalid setup"))
        }

        if (obj.AIplays === 1) {
            gameEngine = new GameEngine(AIPlayer, HumanPlayer);
            AIPlay(AIPlayer, gameEngine);

        } else {
            gameEngine = new GameEngine(HumanPlayer, AIPlayer);
        }
    });

    socket.on("newMove", (globalCoordinates) => {
        console.log("newMove", globalCoordinates);
        try {
            let column = globalCoordinates[0];
            let row = globalCoordinates[1];

            let gameState = gameEngine.playTurn(HumanPlayer, column, row)

            gameSocket.emit("updatedBoard", gameEngine.grid)
            if (gameState.isFinished === true) {
                gameSocket.emit("gameIsOver", gameState.winner)
            }
            AIPlay(AIPlayer, gameEngine);
        } catch (e) {
            console.log(e);
            console.log("playError : " + e.message + " error for player : " + gameEngine.currentPlayingPlayer.name)
            gameSocket.emit("playError", e.message + " error for player : " + gameEngine.currentPlayingPlayer.name)
        }
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

let addUser = async function (user) {
    await userdb.addUser(user);
}
