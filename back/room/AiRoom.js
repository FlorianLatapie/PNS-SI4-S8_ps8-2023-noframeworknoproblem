import Player from "../../front/GameLogic/Player.js";

import jwt from 'jsonwebtoken';
import GameEngine from '../../front/GameLogic/GameEngine.js';
import * as crypto from "crypto";
import GameEngineDBUtil from "../object/GameEngineDBUtil.js";
import {AI} from "../logic/minMaxAi.js";
import gamedb from "../database/gamedb.js";
import {displayACatchedError} from "../util/util.js";


class AiRoom {
  #player;

  #gameEngine;

  #ai;

  #gameSocket;

  #AIPlayer;
  #HumanPlayer;

  constructor(player, gameSocket) {
    this.#player = player;
    this.#gameSocket = gameSocket;
    this.#ai = new AI();

    let userId = this.#player.userId;
    this.#AIPlayer = new Player("AI", userId + "-AI")
    this.#HumanPlayer = new Player("HumanPlayer", userId)

    this.#player.on('newMove', this.readNewMove);
    this.#player.on('disconnect', () => {
      console.log('user ' + this.#player.id + ' disconnected');
    });

    console.log("-------------------------------------")
    console.log('Socket connected: id = ' + this.#player.id + ' username = ' + this.#player.username + ' userId = ' + this.#player.userId);
  }

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

  returnBoard = () => {
    this.#gameSocket.to(this.#player.id).emit("updatedBoard", {board: this.#gameEngine.grid.cells})
  }

  // TODO : Le problème est que gameEngine.id est undefined je sais pas trop pourquoi à voir plus tard
  saveOrDeleteGame = (gameState, gameEngine) => {
    console.log("Player id ", this.#player.id)
    /*
    if (gameState.isFinished === true) {
      GameEngineDBUtil.removeGameEngineFromDB(gameEngine.id)
      this.#gameSocket.to(this.#player.id).emit("gameIsOver", gameState.winner)
    } else {
      GameEngineDBUtil.saveGameEngineToFSAndDB(gameEngine, "./back/savedGames/" + gameEngine.id + ".json")
    }
     */
  }

  playerPlay = (player, column, row)  => {
    let gameState = this.#gameEngine.playTurn(player, column, row);
    this.#gameSocket.to(this.#player.id).emit("updatedBoard", {board: this.#gameEngine.grid.cells})

    this.saveOrDeleteGame(gameState);
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

    console.log("Human plays : ", this.#HumanPlayer)
    this.playerPlay(this.#HumanPlayer, column, row);
    return [column, row];
  }

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

  newGame = (setupObject) => {
    console.log("game engine not found in the database, creating a new game ...")

    // game engine not found : create a new one
    if (setupObject.AIplays !== 1 && setupObject.AIplays !== 2) {
      this.#gameSocket.to(this.#player.id).emit("errorSetUp", new Error("Invalid setup"));
      return;
    }

    let uuid = crypto.randomBytes(16).toString("hex");

    this.#ai.setup(setupObject.AIplays);

    if (setupObject.AIplays === 1) {
      console.log("AI plays first")
      this.#gameEngine = new GameEngine(this.#AIPlayer, this.#HumanPlayer, uuid);
      this.AIPlay([]);
      console.log("AI plays")
    } else {
      console.log("Human plays first")
      this.#gameEngine = new GameEngine(this.#HumanPlayer, this.#AIPlayer, uuid);
    }
  }


  readNewMove=(globalCoordinates)=> {
    console.log("newMove", globalCoordinates);
    console.log("Game Engine ", this.#gameEngine)
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
