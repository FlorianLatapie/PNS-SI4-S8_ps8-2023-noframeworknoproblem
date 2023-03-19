import Grid from "../../GameLogic/Grid.js";
import GameState from "./GameState.js";

class SocketMatchmaking {
    #gameSocket;
    #webPageInteraction;
    #grid;
    #gameState;
    #interval;

    constructor(webPageInteraction, grid) {
        this.#gameSocket = io("/api/game", {auth: {token: localStorage.getItem("token")}});
        this.#webPageInteraction = webPageInteraction;
        this.#grid = grid;
        this.#setSocketListeners();
    }

    startGame = () => {
        this.#gameSocket.emit("matchmaking");
    }

    #setSocketListeners = () => {
        this.#gameSocket.on("connect", () => {
            this.#gameSocket.on("updatedBoard", this.#updatedBoardFunction);
            this.#gameSocket.on("gameIsOver", this.#gameIsOverFunction);
            this.#gameSocket.on("setup", this.#setupFunction);
            this.#gameSocket.on("waitingForOpponent", this.#waitingForOpponentFunction);
            this.#gameSocket.on("reconnect", this.#reconnectFunction);
            this.#gameSocket.on("alreadyConnected", this.#alreadyConnectedFunction);
            this.#gameSocket.on("timer", this.#timerFunction);
        });
    }

    #timerFunction = (time) => {
        if (time !== 0) {
            this.#interval = setInterval(() => {
                time -= 1000;
                this.#webPageInteraction.updateTimer(time, this.#gameState.getToPlay());
            }, 1000);
        }else{
            this.#webPageInteraction.updateTimer(0, this.#gameState.getToPlay());
            clearInterval(this.#interval);
        }
    }

    #updatedBoardFunction = (globalCoordsGrid) => {
        clearInterval(this.#interval);
        console.log("updatedBoard received", globalCoordsGrid);
        let move = this.#grid.findMove(globalCoordsGrid.board)
        this.#grid.cells = globalCoordsGrid.board

        // TODO : need to change later
        // the client has to play
        if (this.#gameState.getToPlay()) {
            // premier updateGrid, le joueur doit don jouer
            // deuxième updateGrid reçu après l'exécution de l'évènement newMove, il faut update lka grille
            this.#webPageInteraction.playerPlay(move.column, move.row, this.#gameState.getColorPlayer())
        } else {
            // the client just receive the confirmation of its move
            this.#webPageInteraction.otherPlayerPlay(move.column, move.row, this.#gameState.getColorOtherPlayer())
        }

        this.#gameState.changeToPlay();
    }

    #gameIsOverFunction = (winner) => {
        this.#webPageInteraction.gameIsOver(winner);
        clearInterval(this.#interval);
    }

    #setupFunction = (OpponentTurn) => {
        console.log("setup received OpponentTurn: " + OpponentTurn)
        let toPlay;
        let colorPlayer;
        let colorOtherPlayer;

        if (OpponentTurn === 1) {
            toPlay = false;
            colorPlayer = Grid.redCellValue
            colorOtherPlayer = Grid.yellowCellValue
            this.#webPageInteraction.otherPlayerTurnMessage();
        } else {
            toPlay = true;
            colorPlayer = Grid.yellowCellValue
            colorOtherPlayer = Grid.redCellValue
            this.#webPageInteraction.playerTurnMessage();
        }
        this.#gameState = new GameState(colorPlayer, colorOtherPlayer, this.#grid, toPlay);
    }

    #waitingForOpponentFunction = () => {
        console.log("waitingForOpponent event received");
        this.#webPageInteraction.waitingForOtherPlayerMessage();
    }

    //TODO : change the event for transmitting the color of the player to play
    #reconnectFunction = (gridReceived, toPlay, color, nameOtherPlayer) => {
        console.log("reconnect received", gridReceived, toPlay)
        this.#grid.cells = gridReceived.board;
        // need to change the color later

        let colorPlayer;
        let colorOtherPlayer;
        if (color === Grid.redCellValue) {
            colorPlayer = Grid.redCellValue;
            colorOtherPlayer = Grid.yellowCellValue;
        } else {
            colorPlayer = Grid.yellowCellValue;
            colorOtherPlayer = Grid.redCellValue;
        }

        this.#gameState = new GameState(colorPlayer, colorOtherPlayer, this.#grid, toPlay);
        this.#webPageInteraction.updateWebPageEntireGrid(this.#grid);
        if (toPlay) {
            // premier updateGrid, le joueur doit don jouer
            // deuxième updateGrid reçu après l'exécution de l'évènement newMove, il faut update la grille
            this.#webPageInteraction.reconnectPlayerTurn();
        } else {
            // the client just receive the confirmation of its move
            this.#webPageInteraction.reconnectOtherPlayerTurn();
        }
    }

    #alreadyConnectedFunction = () => {
        console.log("alreadyConnected event received");
        this.#webPageInteraction.alreadyConnectedMessage();
    }

    newMoveEmit = (column, row) => {
        this.#gameSocket.emit("newMove", [+column, +row]);
        console.log("newMove", [column, row]);
    }

    giveUpEmit = () => {
        this.#gameSocket.emit("giveUp");
        console.log("giveUp");
    }
}

export default SocketMatchmaking;
