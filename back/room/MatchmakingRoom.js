import Player from "../../front/GameLogic/Player.js";

import jwt from 'jsonwebtoken';
import GameEngine from '../../front/GameLogic/GameEngine.js';
import * as crypto from "crypto";
import GameEngineDBUtil from "../object/GameEngineDBUtil.js";
import {AI} from "../logic/minMaxAi.js";
import gamedb from "../database/gamedb.js";
import {displayACatchedError} from "../util/util.js";


class MatchmakingRoom {
    #player1;

    #gameEngine;

    #player2;

    #gameSocket;

    #HumanPlayers = {};

    #room;

    constructor(player1, player2, gameSocket) {
        this.#player1 = player1;
        this.#player2 = player2;
        this.#gameSocket = gameSocket;
        this.#room = crypto.randomBytes(16).toString('hex');

        this.newGame();

        this.setListeners(this.#player1, 2);
        this.setListeners(this.#player2, 1);
    }

    setListeners = (socket, playPositionOfOpponent) => {
        // TODO : Need to bind the socket to the function readNewMove
        socket.on('newMove', this.readNewMove.bind(this, socket));
        socket.on('disconnect', () => {
            console.log('user ' + socket.id + ' disconnected');
        });
        socket.join(this.#room);

        socket.emit("setup", playPositionOfOpponent);
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

    returnBoard = () => {
        this.#gameSocket.to(this.#room).emit("updatedBoard", {board: this.#gameEngine.grid.cells})
    }

    // TODO : Le problème est que gameEngine.id est undefined je sais pas trop pourquoi à voir plus tard
    saveOrDeleteGame = (gameState) => {
        if (gameState.isFinished === true) {
          //GameEngineDBUtil.removeGameEngineFromDB(gameEngine.id)
          this.#gameSocket.to(this.#room).emit("gameIsOver", gameState.winner)
        } else {
          //GameEngineDBUtil.saveGameEngineToFSAndDB(gameEngine, "./back/savedGames/" + gameEngine.id + ".json")
        }
    }

    playerPlay = (player, column, row)  => {
        let gameState = this.#gameEngine.playTurn(player, column, row);
        this.#gameSocket.to(this.#room).emit("updatedBoard", {board: this.#gameEngine.grid.cells})

        this.saveOrDeleteGame(gameState);
    }

    humanPlay = (globalCoordinates, socket) => {
        let column = globalCoordinates[0];
        let row = globalCoordinates[1];

        this.playerPlay(this.#HumanPlayers[socket.userId], column, row);
        console.log("HumanPlay new board ",  this.#gameEngine.grid.toString())
        return [column, row];
    }

    /*
    autoPlay = (gameEngineFromDB) => {
        for (let i = 0; i < gameEngineFromDB.turns.length; i++) {
            if (i % 2 === 0) {
                this.#gameEngine.playTurn(this.#HumanPlayer, gameEngineFromDB.turns[i])
                let sentBoard = {
                    board: this.#gameEngine.grid.cells
                }
                this.#gameSocket.to(this.#player.id).emit("updatedBoard", sentBoard)
            } else {
                this.#gameEngine.playTurn(this.#AIPlayer, gameEngineFromDB.turns[i])
                let sentBoard = {
                    board: this.#gameEngine.grid.cells
                }
                this.#gameSocket.to(this.#player.id).emit("updatedBoard", sentBoard)
            }
        }
        console.log(this.#gameEngine.grid.toString())
    }

    reloadGameFromDB = (dbResult, userId) => {
        console.log("game found in the database")
        // load the game engine from the file system
        let gameEngineFromDB = dbResult.gameEngine;

        if (gameEngineFromDB.player1.id === userId) {
            this.#gameEngine = new GameEngine(this.#HumanPlayer, this.#AIPlayer, gameEngineFromDB.id);
            this.autoPlay(gameEngineFromDB);
        } else {
            this.#gameEngine = new GameEngine(this.#AIPlayer, this.#HumanPlayer, gameEngineFromDB.id);
            this.autoPlay(gameEngineFromDB);
            console.log(this.#gameEngine.grid.toString())
        }
    }
     */

    newGame = () => {
        this.#HumanPlayers[this.#player1.userId] = new Player(this.#player1.username, this.#player1.userId);
        this.#HumanPlayers[this.#player2.userId] = new Player(this.#player2.username, this.#player2.userId);

        let uuid = crypto.randomBytes(16).toString("hex");
        this.#gameEngine = new GameEngine(this.#HumanPlayers[this.#player1.userId], this.#HumanPlayers[this.#player2.userId], uuid);

        console.log("Player 1 : ", this.#HumanPlayers[this.#player1.userId])
        console.log("Player 2 : ", this.#HumanPlayers[this.#player2.userId])
    }


    readNewMove=(socket, globalCoordinates)=> {
        console.log("MatchmakingRoom.readNewMove parameter socket", socket);
        console.log("MatchmakingRoom.readNewMove parameter globalCoordinates", globalCoordinates);

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
}

export {MatchmakingRoom}
