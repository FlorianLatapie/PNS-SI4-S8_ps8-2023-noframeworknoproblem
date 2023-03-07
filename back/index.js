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
import {nextMove, setup} from "./logic/minMaxAi.js";
import jwt from "jsonwebtoken";
import GameEngineDBUtil from "./object/GameEngineDBUtil.js";
import {displayACatchedError} from "./util/util.js";
import {JWTSecretCode} from "./credentials/credentials.js";
import {AiRoom} from "./room/AiRoom.js";

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

// Connection ----------------------------------------------------------------------------------------------------------
gameSocket.on('connection', (socket) => {
    console.log("Socket id player : " + socket.id);

    socket.on('setup', (setupObject) => {
        (new AiRoom(socket, gameSocket)).readSetup(setupObject);
    });

    socket.on('matchmaking', () => {

    });
    // giveUp ----------------------------------------------------------------------------------------------------------
    socket.on("giveUp", () => {
        socket.emit("gameIsOver", gameEngine.getOtherPlayer().name);
        GameEngineDBUtil.removeGameEngineFromDB(gameEngine.id);
    });

    // disconnect ------------------------------------------------------------------------------------------------------
    socket.on('disconnect', () => {
        console.log('user ' + socket.id + ' disconnected');
    });

});

