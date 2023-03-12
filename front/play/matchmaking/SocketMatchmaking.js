import {Position} from "../../GameLogic/Position.js";
import {parseJwt} from "../../util/jwtParser.js";
import Grid from "../../GameLogic/Grid.js";
import GameState from "./GameState.js";

class SocketMatchmaking {
    #gameSocket;
    #webPageInteraction;
    #grid;
    #gameState;

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
        });
    }

    #updatedBoardFunction = (globalCoordsGrid) => {
        console.log("updatedBoard received", globalCoordsGrid);
        let move = this.#grid.findMove(globalCoordsGrid.board)
        this.#grid.cells = globalCoordsGrid.board

        // TODO : need to change later
        // the client has to play
        if (this.#gameState.getToPlay()) {
            // premier updateGrid, le joueur doit don jouer
            // deuxième updateGrid reçu après l'exécution de l'évènement newMove, il faut update lka grille
            this.#webPageInteraction.updateWebPageGrid(move.column, move.row, this.#gameState.getColorPlayer())
            this.#webPageInteraction.removeListeners();
            document.getElementById("page-title").innerText = "Au tour de l'adversaire";
        } else {
            // the client just receive the confirmation of its move
            this.#webPageInteraction.updateWebPageGrid(move.column, move.row, this.#gameState.getColorOtherPlayer())
            this.#webPageInteraction.addListeners();
            document.getElementById("page-title").innerText = "A ton tour";
        }

        this.#gameState.changeToPlay();
    }

    #gameIsOverFunction = (winner) => {
        let divWinner = document.getElementById("show-winner");
        let close = document.getElementById("cross");
        let winnerText = document.getElementById("winner-text");
        close.addEventListener("click", function () {
            divWinner.style.display = "none";
        });
        if (winner === "draw") {
            winnerText.innerText = "Egalité !!";
        } else {
            if (winner === parseJwt(localStorage.getItem("token")).username) {
                winnerText.innerText = "Tu as gagné !!";
                let image = document.getElementById("pic");
                image.src = "../../images/smile.png";
            } else {
                winnerText.innerText = "Tu as perdu !!";
            }
        }
        divWinner.style.display = "block";
        this.#webPageInteraction.removeListeners();
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
            document.getElementById("page-title").innerText = "Au tour de l'adversaire";
        } else {
            toPlay = true;
            colorPlayer = Grid.yellowCellValue
            colorOtherPlayer = Grid.redCellValue
            document.getElementById("page-title").innerText = "A ton tour";
        }
        this.#gameState = new GameState(colorPlayer, colorOtherPlayer, this.#grid, toPlay);
    }

    #waitingForOpponentFunction = () => {
        // TODO : put an explicit message on the web page
        document.getElementById("page-title").innerText = "En attente d'un adversaire";
        console.log("waitingForOpponent");
    }

    //TODO : change the event for transmitting the color of the player to play
    #reconnectFunction = (gridReceived, playerPlayed) => {
        console.log("reconnect received", gridReceived, playerPlayed)
        this.#grid.cells = gridReceived.board;
        // need to change the color later
        let colorPlayer = Grid.redCellValue;
        let colorOtherPlayer = Grid.yellowCellValue;

        this.#gameState = new GameState(colorPlayer, colorOtherPlayer, this.#grid, playerPlayed);
        this.#webPageInteraction.updateWebPageEntireGrid(this.#grid);
        if (playerPlayed) {
            // premier updateGrid, le joueur doit don jouer
            // deuxième updateGrid reçu après l'exécution de l'évènement newMove, il faut update la grille
            document.getElementById("page-title").innerText = "A ton tour";
            this.#webPageInteraction.addListeners();
        } else {
            // the client just receive the confirmation of its move
            document.getElementById("page-title").innerText = "Au tour de l'adversaire !";
            this.#webPageInteraction.removeListeners();
        }
    }

    newMoveEmit = (column, row) => {
        this.#gameSocket.emit("newMove", [+column, +row]);
        console.log("newMove", [column, row]);
    }
}

export default SocketMatchmaking;
