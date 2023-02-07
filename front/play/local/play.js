"use strict";

import Player from "../../GameLogic/Player.js";
import GameEngine from "../../GameLogic/GameEngine.js";

let p1 = new Player("alice", 0)
let p2 = new Player("bob", 1)
let ge = new GameEngine(p1, p2)

function WebPageInteraction() {
    this.cells = ge.grid.cells;

    this.webPagePlayTurn = function () {
        let clickCoords = this.id.split("-");
        let column = clickCoords[0];
        let row = ge.grid.getRowOfLastDisk(column);
        let cell = document.getElementById(column + "-" + row);

        // play turn changes the current player, so we need to get the other player for the next lines of code
        ge.playTurn(ge.currentPlayingPlayer, clickCoords[0]);

        cell.classList.add("fall");
        if (ge.getOtherPlayer().color === ge.grid.redCellValue) {
            cell.classList.add("red-piece");
        } else {
            cell.classList.add("yellow-piece");
        }

        if (ge.isGameOver) {
            let winner = document.getElementById("winner");
            winner.innerText = ge.getOtherPlayer().color + " wins !";

            document.querySelectorAll(".grid-item").forEach(c => {
                c.removeEventListener("click", this.webPagePlayTurn);
                c.style.cursor = "not-allowed";
            });
            return "Game is over";
        }
    }

    // Constructor -----------------------------------------------------------------------------------------------------
    let height = ge.grid.height;
    let width = ge.grid.width;

    for (let column = 0; column < width; column++) {
        for (let line = 0; line < height; line++) {
            let cell = document.getElementById(column + "-" + line);
            cell.setAttribute("value", this.cells[line][column]);
            cell.addEventListener("click", this.webPagePlayTurn);
        }
    }
}

let wpi = new WebPageInteraction(ge)

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
