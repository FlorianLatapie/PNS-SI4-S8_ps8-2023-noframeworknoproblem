"use strict";

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
import jwt, {verify} from "jsonwebtoken";
import GameEngineDBUtil from "./object/GameEngineDBUtil.js";
import {displayACaughtError} from "./util/util.js";
import {JWTSecretCode} from "./credentials/credentials.js";
import {AiRoom} from "./play/room/AiRoom.js";
import {MatchmakingRoom} from "./play/room/MatchmakingRoom.js";
import {jsonValidator} from "./util/jsonValidator.js";
import PlayersQueue from "./play/matchmaking/PlayersQueue.js";
import MatchmakingController from "./play/matchmaking/MatchmakingController.js";
import userstatsdb from "./database/userstatsdb.js";
import achievementdb from "./database/achievementdb.js";
import connectedPlayer from "./socket/PermanentSocketPlayers.js";
import ChallengeController from "./play/challenge/ChallengeController.js";
import ConnectedPlayers from "./socket/ConnectedPlayers.js";
import chatManager from "./socket/chatManager.js";

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
        displayACaughtError(error, `error while processing ${request.url}:`)
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
const gameSocket = io.of("/api/game");
const chatSocket = io.of("/api/chat");
const permanentSocket = io.of("/api/permanent")

// removes all the games from the database when the server starts/restarts
gamedb.removeAllGames().then(() => {
    console.log("Server started, all the games        have been removed from the database, look for /back/index.js to change this behaviour");
});
userstatsdb.removeAllStats().then(() => {
    console.log("Server started, all the user STATS   have been removed from the database, look for /back/index.js to change this behaviour");
});

/*achievementdb.removeAllAchievements().then(() => {
    console.log("Server started, all the achievements have been removed from the database, look for /back/index.js to change this behaviour");
});*/

function authenticate(socket, next) {
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
    authenticate(socket, next);
});

chatSocket.use((socket, next) => {
    authenticate(socket, next);
});

// Connection ----------------------------------------------------------------------------------------------------------

let verifyObjectSetup = (setupObject) => {
    let schema = {AIplays: 'number'}
    let newObject = jsonValidator(setupObject, schema);

    if (newObject.AIplays !== 1 && newObject.AIplays !== 2) {
        throw new Error("AIPlays must be 1 or 2 not " + newObject.AIplays);
    }

    return newObject;
}

let connectedPlayers = new ConnectedPlayers();
let matchmakingController = new MatchmakingController(gameSocket, connectedPlayers);
let challengeController = new ChallengeController(gameSocket, connectedPlayers);

gameSocket.on('connection', (socket) => {
    console.log("Socket id player : " + socket.id);
    console.log("Player " + socket.username + " connected");

    socket.once('setup', (setupObject) => {
        socket.removeAllListeners();
        try {
            let setupObjectChecked = verifyObjectSetup(setupObject);
            new AiRoom(socket, gameSocket, setupObjectChecked.AIplays);
        } catch (error) {
            gameSocket.to(socket.id).emit("error", error.message);
        }
    });

    socket.once('challenge_request', (id_challenged) => {
        console.log("challenge request received from " + socket.username + " to " + id_challenged)
        challengeController.challengeRequest(socket, id_challenged);
    });

    socket.once('challenge_accepted', (id_challenge_sender) => {
        console.log("challenge accepted received from " + socket.username + " to " + id_challenge_sender)
        challengeController.challengeAccepted(socket, id_challenge_sender);
    });

    socket.once('matchmaking', () => {
        matchmakingController.newConnection(socket);
    });
});

permanentSocket.use((socket, next) => {
    authenticate(socket, next);
});

permanentSocket.on('connection', (socket) => {
    connectedPlayer.addPlayer(socket);

    // TODO : need to change later to a better way to handle the disconnection with timeout
    socket.on("disconnect", () => {
        connectedPlayer.removePlayer(socket);
    });
});

// Chat ---------------------------------------------------------------------------------------------------------------

let chatRooms = [];
chatSocket.on('connection', (socket) => {
    console.log("Socket id chat : " + socket.id);

    let roomId;

    socket.on('init', async (user1, user2) => {
        if (user1 < user2) {
            roomId = user1 + user2;
        } else {
            roomId = user2 + user1;
        }
        if (!(chatRooms.includes(roomId))) {
            chatRooms.push(roomId);
        }
        socket.join(roomId);
        console.log("rooms", socket.rooms)
        let chat = new chatManager(user1, user2);
        let messages = chat.getMessages(10, 0);
        chatSocket.to(socket.id).emit('initMessagesFromBack', await messages);

    })

    socket.on('sendMessage', (message, user1, user2) => {
        //socket.join(roomId);

        let chat = new chatManager(user1, user2);
        chat.addMessage(message).then(() => {
            console.log("message added to the database");
            //socket.emit('getMessages', user1, user2, 10, 0);
        }).catch(e => {
            console.log("error while adding the message to the database");
            console.log(e);
        });
    });

    socket.on('getMessages', async (user1, user2, numberMessagesToGet, numberMessagesToSkip) => {
        let chat = new chatManager(user1, user2);
        let messages = chat.getMessages(numberMessagesToGet, numberMessagesToSkip);
        chatSocket.to(roomId).emit('getMessagesFromBack', await messages);
    });


    socket.on('read', (user1, user2) => {
        let chat = new chatManager(user1, user2);
        chat.readMessages().then(() => {
            console.log("messages read");
        }).catch(e => {
            console.log("error while reading the messages");
            console.log(e);
        });
    });

    socket.on('getLastMessage', async (user1, user2) => {
        let chat = new chatManager(user1, user2);
        let lastMessage = chat.getLastMessage();
        chatSocket.to(socket.id).emit('getLastMessageFromBack', await lastMessage, user2);
    });

    socket.on('disconnect', () => {
        console.log("Socket id chat : " + socket.id + " disconnected");
    });
});


