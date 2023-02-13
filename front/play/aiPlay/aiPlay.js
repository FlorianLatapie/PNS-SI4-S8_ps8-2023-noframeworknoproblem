"use strict";

import {Position} from "../../GameLogic/Position.js";
import Grid from "../../GameLogic/Grid.js";

const gameSocket = io("http://localhost:8000/api/game", {auth: {token: localStorage.getItem("token")}});
let grid = new Grid(7, 6);

let toPlay;
let colorPlayer;
let colorOtherPlayer;

function WebPageInteraction() {

    this.updateWebPageGrid = function (column, row, color) {
        let cell = document.getElementById(column + "-" + row);

        cell.classList.add("fall");
        if (color === grid.redCellValue) {
            cell.classList.add("red-piece");
        } else {
            cell.classList.add("yellow-piece");
        }
    }

    this.webPagePlayTurn = function (event) {
        let clickCoords = event.target.id.split("-");
        let column = clickCoords[1];
        let row = clickCoords[0];
        play(column, row);
    }
    // Constructor -----------------------------------------------------------------------------------------------------
    let height = grid.height;
    let width = grid.width;

    for (let column = 0; column < width; column++) {
        for (let line = 0; line < height; line++) {
            let cell = document.getElementById(column + "-" + line);
            cell.setAttribute("value", grid.defaultCellValue);
            cell.addEventListener("click", this.webPagePlayTurn);
        }
    }

}

let wpi = new WebPageInteraction()

let setupAI = function (AIplayTurn) {
    if (AIplayTurn !== 1 && AIplayTurn !== 2) {
        throw new Error("the value " + AIplayTurn + " of AIplay for the setup is invalid")
    }

    if (AIplayTurn === 1) {
        toPlay = false;
        colorPlayer = grid.redCellValue
        colorOtherPlayer = grid.yellowCellValue
        document.getElementById("page-title").innerText = "Au tour de l'adversaire";
    } else {
        toPlay = true;
        colorPlayer = grid.yellowCellValue
        colorOtherPlayer = grid.redCellValue
        document.getElementById("page-title").innerText = "A ton tour";
    }

    gameSocket.emit("setup", {AIplays: AIplayTurn})
    console.log("setup", {AIplays: AIplayTurn})
}

let play = function (clickRow, clickColumn) {
    let column = clickColumn;
    let row = grid.getRowOfLastDisk(column);

    // emit the event of the play not working yet
    gameSocket.emit("newMove", [column, row]);
    console.log("newMove", [column, row]);
    return new Position(column, row)
}

/*gameSocket.on("connect_error", (err) => {
    console.log("Connection error: " + err.message)
})*/
gameSocket.on("connect", () => {
    console.log("Connected as human for a game vs AI with socket.id: " + gameSocket.id);
    console.log("token: " + localStorage.getItem("token"));

    setupAI(2);

    gameSocket.on("updatedBoard", globalCoordsGrid => {
        let move = grid.findMove(globalCoordsGrid.board)
        grid.cells = globalCoordsGrid.board

        // the client has to play
        if (toPlay) {
            // premier updateGrid, le joueur doit don jouer
            // deuxième updateGrid reçu après l'exécution de l'évènement newMove, il faut update lka grille
            wpi.updateWebPageGrid(move.column, move.row, colorPlayer)
            document.getElementById("page-title").innerText = "Au tour de l'adversaire";
        } else {
            // the client just receive the confirmation of its move
            wpi.updateWebPageGrid(move.column, move.row, colorOtherPlayer)
            document.getElementById("page-title").innerText = "A ton tour";
        }
        toPlay = !toPlay
    })

    gameSocket.on("gameIsOver", winner => {
        let divWinner = document.getElementById("winner");

        if (winner === "draw") {
            //TODO il faut changer le message
            divWinner.innerText = "Nobody wins";
        } else {
            divWinner.innerText = winner + " wins !"
        }

        document.querySelectorAll(".grid-item").forEach(c => {
            c.removeEventListener("click", wpi.webPagePlayTurn);
            c.style.cursor = "not-allowed";
        });
    });

    gameSocket.on("playError", (Error) => {
        console.log("playError received:", Error)
    });
});
