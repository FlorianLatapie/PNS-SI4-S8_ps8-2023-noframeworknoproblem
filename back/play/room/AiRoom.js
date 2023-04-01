"use strict";

import Player from "../../../front/GameLogic/Player.js";
import GameEngine from '../../../front/GameLogic/GameEngine.js';
import * as crypto from "crypto";
import {AI, setup} from "../../logic/minMaxAi.js";
import gamedb from "../../database/gamedb.js";
import {displayACaughtError} from "../../util/util.js";
import {STATSaddGamePlayed} from "../../object/UserStatsDBUtil.js";
import GameEngineDBUtil from "../../object/GameEngineDBUtil.js";

class AiRoom {
    #player;

    #gameEngine;

    #ai;

    #gameSocket;

    #AIPlayer;
    #HumanPlayer;

    constructor(player, gameSocket, setupObject) {
        this.#player = player;
        this.#gameSocket = gameSocket;

        this.#ai = new AI();
        this.#AIPlayer = new Player("AI", 1)
        this.#HumanPlayer = new Player("HumanPlayer", this.#player.userId)

        this.#setListeners(this.#player);
        this.readSetup(setupObject);

        console.log("-------------------------------------")
        console.log('Socket connected: id = ' + this.#player.id + ' username = ' + this.#player.username + ' userId = ' + this.#player.userId);

    }

    #setListeners = (socket) => {
        socket.removeAllListeners();
        this.#player.on('newMove', this.readNewMove);
        this.#player.on('disconnect', () => {
            console.log('user ' + this.#player.id + ' disconnected');
        });
        this.#player.on('giveUp', this.#giveUpFunction);
    }

    #giveUpFunction = () => {
        let winner = this.#gameEngine.getOpponentPlayer(this.#player.userId).name;
        this.#gameIsOverEmit(winner);
        this.#player.removeAllListeners();
    }

    #gameIsOverEmit = (winner) => {
        STATSaddGamePlayed(this.#player.userId);
        GameEngineDBUtil.removeGameEngineFromDB(this.#gameEngine.id);

        this.#gameSocket.to(this.#player.id).emit("gameIsOver", winner)

        console.log("gameIsOverEmit AIRoom", winner)
    }

    readSetup = (setupObject) => {
        let userId = this.#player.userId;
        console.log("setup", setupObject);
        // search for a game engine in the db
        gamedb.getGamePlayerId(userId).then((dbResult) => {
            if (dbResult !== null) {
                console.log("There is a database db");
                this.reloadGameFromDB(dbResult, userId);
            } else {
                console.log("There is no database db")
                this.newGame(setupObject);
            }
        }).catch(function (error) {
            displayACaughtError(error, "error while searching for a game engine in the database");
        });
    }

    saveOrDeleteGame = (gameState) => {
        console.log("Player id ", this.#player.id)
        if (gameState.isFinished === true) {
            console.log("Game is finished, removing from db..." + this.#gameEngine.turns.length)
            this.#gameIsOverEmit(gameState.winner)
        } else {
            console.log("Game is not finished, saving to db..." + this.#gameEngine.turns.length)
            GameEngineDBUtil.saveGameEngineDB(this.#gameEngine);
        }
    }

    playerPlay = (player, column, row) => {
        let gameState = this.#gameEngine.playTurn(player, column, row);
        this.#updatedBoardEmit({board: this.#gameEngine.grid.cells})

        console.log("we will save the turn #" + this.#gameEngine.turns.length + " to the database")
        this.saveOrDeleteGame(gameState);
    }

    #updatedBoardEmit = (grid) => {
        this.#gameSocket.to(this.#player.id).emit("updatedBoard", grid)
    }

    AIPlay = (lastMove) => {
        let start = Date.now();
        console.log("AI computation start: " + start + " ms")
        let globalCoordinatesAI = this.#ai.nextMove(lastMove); // computeMove from ai.js : [column, row]
        console.log("AI computation time: " + (Date.now() - start) + " ms")
        let column = globalCoordinatesAI[0];
        let row = globalCoordinatesAI[1];

        console.log("AI plays: column " + column + " row " + row)

        if (column === undefined || row === undefined) {
            throw new Error("AI plays undefined: column " + column + " row " + row)
        }

        this.playerPlay(this.#AIPlayer, column, row);
    }

    humanPlay = (globalCoordinates) => {
        let column = globalCoordinates[0];
        let row = globalCoordinates[1];

        this.playerPlay(this.#HumanPlayer, column, row);
        return [column, row];
    }

    autoPlay = (gameEngineFromDB) => {
        let firstPlayer, secondPlayer;

        if (gameEngineFromDB.player1.id === this.#HumanPlayer.id){
            firstPlayer = this.#HumanPlayer;
            secondPlayer = this.#AIPlayer;
        } else {
            firstPlayer = this.#AIPlayer;
            secondPlayer = this.#HumanPlayer;
        }

        for (let i = 0; i < gameEngineFromDB.turns.length; i++) {
            if (i % 2 === 0) {
                this.#gameEngine.playTurn(firstPlayer, gameEngineFromDB.turns[i])
                let sentBoard = {
                    board: this.#gameEngine.grid.cells
                }
                this.#updatedBoardEmit(sentBoard);
            } else {
                this.#gameEngine.playTurn(secondPlayer, gameEngineFromDB.turns[i])
                let sentBoard = {
                    board: this.#gameEngine.grid.cells
                }
                this.#updatedBoardEmit(sentBoard);
            }
        }

        this.#ai.grid = this.#gameEngine.grid.cells.map(row => row.map(cell => parseInt(cell)));
    }

    reloadGameFromDB = (dbResult, userId) => {
        console.log("game found in the database")
        // load the game engine from the file system
        let gameEngineFromDB = dbResult.gameEngine;

        if (gameEngineFromDB.player1.id === userId) {
            this.#ai.setup(2);

            this.#gameEngine = new GameEngine(this.#HumanPlayer, this.#AIPlayer, gameEngineFromDB.id);
        } else {
            this.#ai.setup(1);

            this.#gameEngine = new GameEngine(this.#AIPlayer, this.#HumanPlayer, gameEngineFromDB.id);
        }

        this.autoPlay(gameEngineFromDB);
    }

    newGame = (AIturn) => {
        console.log("game engine not found in the database, creating a new game ...")

        // game engine not found : create a new one

        let uuid = crypto.randomBytes(16).toString("hex");

        this.#ai.setup(AIturn);

        if (AIturn === 1) {
            console.log("AI plays first")
            this.#gameEngine = new GameEngine(this.#AIPlayer, this.#HumanPlayer, uuid);
            this.AIPlay([]);
            console.log("AI plays")
        } else {
            console.log("Human plays first")
            this.#gameEngine = new GameEngine(this.#HumanPlayer, this.#AIPlayer, uuid);
        }
    }


    readNewMove = (globalCoordinates) => {
        console.log("newMove", globalCoordinates);
        //console.log("Game Engine ", this.#gameEngine)
        globalCoordinates[0] = parseInt(globalCoordinates[0]);
        globalCoordinates[1] = parseInt(globalCoordinates[1]);

        try {
            let moveHuman = this.humanPlay(globalCoordinates);
            if (!this.#gameEngine.isGameOver) {
                this.AIPlay(moveHuman);
            }
        } catch (e) {
            console.log(e);
            console.log("playError : " + e.message + " error for player : " + this.#gameEngine.currentPlayingPlayer.name)
            this.#gameSocket.to(this.#player.id).emit("playError", e.message + " error for player : " + this.#gameEngine.currentPlayingPlayer.name)
        }
        console.log("end of newMove ----------------------------------------------------------------------------------")
    }
}

export {AiRoom}
