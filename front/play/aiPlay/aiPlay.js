"use strict";

import {Position} from "../../GameLogic/Position.js";
import Grid from "../../GameLogic/Grid.js";

// this is the only class that should/can interact with the html

const gameSocket = io("http://localhost:8000/api/game");
let grid = new Grid(7, 6);

let toPlay;
let colorPlayer;
let colorOtherPlayer;

function WebPageInteraction() {

    this.updateWebPageGrid = function(column, row, color) {
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
        let column = clickCoords[0];
        let row = clickCoords[1];
        play(column, row)
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

let setupAI = function(IAplayTurn) {
    if (IAplayTurn !== 1 && IAplayTurn !== 2) {
        throw new Error("the value " + IAplayTurn + " of IAplay for the setup is invalid")
    }

    if (IAplayTurn === 1) {
        toPlay = false;
        colorPlayer = grid.redCellValue
        colorOtherPlayer = grid.yellowCellValue
    } else {
        toPlay = true;
        colorPlayer = grid.yellowCellValue
        colorOtherPlayer = grid.redCellValue
    }

    gameSocket.emit("setup", {AIplays: IAplayTurn})
}

let play = function (clickRow, clickColumn) {
    let column = clickColumn;
    let row = grid.getRowOfLastDisk(column);

    console.log("clickColumn: " + clickColumn + " clickRow: " + clickRow)
    console.log("column: " + column + " row: " + row)

    // emit the event of the play not working yet 
    gameSocket.emit("newMove", [column, row])
    return new Position(column, row)
}

gameSocket.on("connect", () => {
    console.log("Connected as human for a game vs AI with ID: "+ gameSocket.id)
    setupAI(2);

    let i = 0
    gameSocket.on("updatedBoard", globalCoordsGrid => {
        // the client has to play
        if (toPlay) {
            // premier updateGrid, le joueur doit don jouer
            if (i === 0) {
                play()
                i++
            }
            // deuxième updateGrid reçu après l'exécution de l'évènement newMove, il faut update lka grille
            if (i === 1) {
                //TODO need to verify that findMove provide the coordinates in the right format for the function updateWebPageGrid
                let move = grid.findMove(globalCoordsGrid)
                wpi.updateWebPageGrid(move.x, move.y, colorPlayer)
                grid = globalCoordsGrid
                toPlay = !toPlay
                i = 0
            }
        } else {
            // the client just receive the confirmation of its move
            let move = grid.findMove(globalCoordsGrid)
            grid = globalCoordsGrid
            wpi.updateWebPageGrid(move.x, move.y, colorOtherPlayer)
            toPlay = !toPlay
        }
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
            c.removeEventListener("click", this.webPagePlayTurn);
            c.style.cursor = "not-allowed";
        });
    });

    gameSocket.on("playError", (Error) => {
        console.log(Error)
    });
});


// A Win test
/*
ge.currentPlayingPlayer = p1
ge.playTurn(p1, 0)
ge.playTurn(p2, 0)
ge.playTurn(p1, 1)
ge.playTurn(p2, 1)
ge.playTurn(p1, 2)
ge.playTurn(p2, 2)
ge.playTurn(p1, 3)
*/

// An equality test
/*
ge.currentPlayingPlayer = p1
ge.playTurn(p1, 0)
ge.playTurn(p2, 1)
ge.playTurn(p1, 2)
ge.playTurn(p2, 3)
ge.playTurn(p1, 4)
ge.playTurn(p2, 5)
ge.playTurn(p1, 6)
ge.playTurn(p2, 1)
ge.playTurn(p1, 2)
ge.playTurn(p2, 3)
ge.playTurn(p1, 4)
ge.playTurn(p2, 5)
ge.playTurn(p1, 6)
ge.playTurn(p2, 2)
ge.playTurn(p1, 0)
ge.playTurn(p2, 0)
ge.playTurn(p1, 1)
ge.playTurn(p2, 4)
ge.playTurn(p1, 3)
ge.playTurn(p2, 6)
ge.playTurn(p1, 5)
ge.playTurn(p2, 0)
ge.playTurn(p1, 1)
ge.playTurn(p2, 2)
ge.playTurn(p1, 3)
ge.playTurn(p2, 4)
ge.playTurn(p1, 5)
ge.playTurn(p2, 6)
ge.playTurn(p1, 0)
ge.playTurn(p2, 1)
ge.playTurn(p1, 2)
ge.playTurn(p2, 3)
ge.playTurn(p1, 4)
ge.playTurn(p2, 5)
ge.playTurn(p1, 6)
ge.playTurn(p2, 0)
ge.playTurn(p1, 1)
ge.playTurn(p2, 2)
ge.playTurn(p1, 3)
ge.playTurn(p2, 4)
ge.playTurn(p1, 5)
ge.playTurn(p2, 6)
*/
