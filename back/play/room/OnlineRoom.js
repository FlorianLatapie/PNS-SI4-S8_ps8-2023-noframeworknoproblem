import Player from "../../../front/GameLogic/Player.js";
import GameEngine from '../../../front/GameLogic/GameEngine.js';
import * as crypto from "crypto";
import matchmakingRoomInstances from "../matchmaking/OnlineRoomInstances.js";
import {STATSaddGamePlayed, STATSupdateElo} from "../../object/UserStatsDBUtil.js";
import userdb from "../../database/userdb.js";

class OnlineRoom {
    #player1;

    #gameEngine;

    #player2;

    #gameSocket;

    #HumanPlayers = {};

    #room;

    #matchmakingRoomInstances;

    #timer;

    // In milliseconds
    #timeToPlay = 10000;


    constructor(player1, player2, gameSocket) {
        this.#player1 = player1;
        this.#player2 = player2;
        this.#gameSocket = gameSocket;
        this.#room = crypto.randomBytes(16).toString('hex');
        this.#matchmakingRoomInstances = matchmakingRoomInstances;

        this.newGame();

        this.initPlayer(this.#player1, 2);
        this.initPlayer(this.#player2, 1);
        this.#timer = this.checkTimer();
    }

    setListeners = (socket) => {
        socket.on("newMove", this.readNewMove.bind(this, socket));
        socket.on("giveUp", this.#giveUpFunction.bind(this, socket));
        socket.on("chatToBack", this.#tempChatFunction.bind(this, socket));
        socket.join(this.#room);
    }

    #giveUpFunction = (socket) => {
        let winner = this.#gameEngine.getOpponentPlayer(socket.userId).name;
        this.#gameIsOver(winner);
        console.log("giveUpFunction", winner)
    }

    #tempChatFunction = (socket, message) => {
        socket.broadcast.to(this.#room).emit("chatToFront", message);
    }

    #gameIsOverEmit = (winner) => {
        this.#gameSocket.to(this.#room).emit("gameIsOver", winner)
    }

    #updatedBoardEmit = (socket) => {
        this.#gameSocket.to(this.#room).emit("updatedBoard", {board: this.#gameEngine.grid.cells})
        if (this.#gameEngine.currentPlayingPlayer.id !== socket.id) {
            this.#timer = this.checkTimer();
        }
    }

    initPlayer = (socket, playPositionOfOpponent) => {
        this.setListeners(socket);
        console.log("initPlayer function ", this.#gameEngine.getOpponentPlayer(socket.userId).name);
        socket.emit("setup", playPositionOfOpponent, this.#gameEngine.getOpponentPlayer(socket.userId));
    }

    /*
    readSetup = (setupObject) => {
        let userId = this.#player.userId;
        console.log("setup", setupObject);
        // search for a game engine in the db
        gamedb.getGamePlayerId(userId).then( (dbResult) => {
            console.log("Before database db", dbResult)
            if (dbResult !== null) {
                console.log("There is a database db");
                this.reloadGameFromDB(dbResult, userId);
            } else {
                console.log("There is no database db")
                this.newGame(setupObject);
            }
        }).catch(function (error) {
            displayACatchedError(error, "error while searching for a game engine in the database");
        });

    }
     */

    // TODO : Le problème est que gameEngine.id est undefined je sais pas trop pourquoi à voir plus tard
    saveOrDeleteGame = (gameState) => {
        if (gameState.isFinished === true) {
            //GameEngineDBUtil.removeGameEngineFromDB(gameEngine.id)
            this.#gameIsOver(gameState.winner)
        } else {
            //GameEngineDBUtil.saveGameEngineToFSAndDB(gameEngine, "./back/savedGames/" + gameEngine.id + ".json")
        }
    }

    playerPlay = (player, column, row) => {
        let gameState = this.#gameEngine.playTurn(player, column, row);
        this.#updatedBoardEmit(player);
        this.saveOrDeleteGame(gameState);
    }

    #gameIsOver = async (winner) => {


        let winnerId;
        let loserId;
        if (winner === this.#player1.username) {
            winnerId = this.#player1.userId;
            loserId = this.#player2.userId;
        } else {
            winnerId = this.#player2.userId;
            loserId = this.#player1.userId;
        }

        STATSupdateElo(winnerId, loserId);

        STATSaddGamePlayed(this.#player1.userId);
        STATSaddGamePlayed(this.#player2.userId);

        this.#gameIsOverEmit(winner)
        this.#matchmakingRoomInstances.gameFinished(this.#player1, this.#player2);
        this.#gameSocket.to(this.#room).emit("timer", 0);
        clearTimeout(this.#timer);
        //this.#removeListeners()
    }

    humanPlay = (globalCoordinates, socket) => {
        let column = globalCoordinates[0];
        let row = globalCoordinates[1];

        this.playerPlay(this.#HumanPlayers[socket.userId], column, row);
        console.log("HumanPlay new board ", this.#gameEngine.grid.toString())
        return [column, row];
    }

    checkTimer = () => {
        this.#gameSocket.to(this.#room).emit("timer", this.#timeToPlay);
        return setTimeout(() => {
            if (this.#gameEngine.currentPlayingPlayer.id === this.#player1.userId) {
                this.#giveUpFunction(this.#player1)
            } else {
                this.#giveUpFunction(this.#player2)
            }
        }, this.#timeToPlay);
    }

    newGame = () => {
        this.#HumanPlayers[this.#player1.userId] = new Player(this.#player1.username, this.#player1.userId);
        this.#HumanPlayers[this.#player2.userId] = new Player(this.#player2.username, this.#player2.userId);

        let uuid = crypto.randomBytes(16).toString("hex");
        this.#gameEngine = new GameEngine(this.#HumanPlayers[this.#player1.userId], this.#HumanPlayers[this.#player2.userId], uuid);

        console.log("Player 1 : ", this.#HumanPlayers[this.#player1.userId])
        console.log("Player 2 : ", this.#HumanPlayers[this.#player2.userId])
    }


    readNewMove = (socket, globalCoordinates) => {
        if (this.#gameEngine.currentPlayingPlayer.id === socket.userId) {
            console.log("clear the timeOut")
            clearTimeout(this.#timer);
        }
        globalCoordinates[0] = parseInt(globalCoordinates[0]);
        globalCoordinates[1] = parseInt(globalCoordinates[1]);

        try {
            this.humanPlay(globalCoordinates, socket);
        } catch (e) {
            console.log(e);
            console.log("playError : " + e.message + " error for player : " + this.#gameEngine.currentPlayingPlayer.name)
            this.#gameSocket.to(this.#room).emit("playError", e.message + " error for player : " + this.#gameEngine.currentPlayingPlayer.name)
        }
        console.log("end of newMove ----------------------------------------------------------------------------------")
    }

    reconnectPlayer = (socket) => {
        console.log("reconnectPlayer", socket.userId)
        console.log("player1", this.#player1.userId)
        console.log("player2", this.#player2.userId)

        let nameOtherPlayer;
        if (this.#player1.userId === socket.userId) {
            this.#player1 = socket;
            nameOtherPlayer = this.#HumanPlayers[this.#player2.userId].name;
            this.setListeners(this.#player1);
            console.log("the player1 is reconnected");
        } else if (this.#player2.userId === socket.userId) {
            this.#player2 = socket;
            nameOtherPlayer = this.#HumanPlayers[this.#player1.userId].name;
            this.setListeners(this.#player2);
            console.log("the player2 is reconnected");
        }

        // évènement reconnectedPlayer : first parameter is the board, second parameter true if the player has to play false otherwise
        this.#gameSocket.to(socket.id).emit("reconnect",
            {board: this.#gameEngine.grid.cells},
            this.#gameEngine.currentPlayingPlayer.id === socket.userId,
            this.#HumanPlayers[socket.userId].color,
            nameOtherPlayer);
    }
}

export {OnlineRoom}
