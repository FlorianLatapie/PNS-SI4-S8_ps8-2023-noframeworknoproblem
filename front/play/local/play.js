"use strict";

import Player from "../../GameLogic/Player.js";
import GameEngine from "../../GameLogic/GameEngine.js";

let p1 = new Player("Jaune", 0)
let p2 = new Player("Rouge", 1)
let ge = new GameEngine(p1, p2)

function WebPageInteraction() {
    this.cells = ge.grid.cells;

    function showWinner(gameState) {
        let showWinner = document.getElementById("show-winner");
        let close = document.getElementById("cross");
        let winnerText = document.getElementById("winner-text");
        close.addEventListener("click", function () {
            showWinner.style.display = "none";
        });
        if (gameState.winner === "draw") {
            winnerText.innerText = "Egalité !!";
            let image = document.getElementById("pic");
            image.src = "../../images/crying.png"
        } else {
            winnerText.innerText = ge.getOtherPlayer().name + " est le gagnant !!";
        }
        showWinner.style.display = "block";
    }

    this.webPagePlayTurn = function () {
        let clickCoords = this.id.split("-");
        let column = clickCoords[0];
        let row = ge.grid.getRowOfLastDisk(column);
        let cell = document.getElementById(column + "-" + row);

        // play turn changes the current player, so we need to get the other player for the next lines of code
        let gameState = ge.playTurn(ge.currentPlayingPlayer, clickCoords[0]);

        cell.classList.add("fall");
        if (ge.getOtherPlayer().color === ge.grid.redCellValue) {
            cell.classList.add("red-piece");
        } else {
            cell.classList.add("yellow-piece");
        }

        if (ge.isGameOver) {
            showWinner(gameState);

            document.querySelectorAll(".grid-item").forEach(c => {
                c.removeEventListener("click", this.webPagePlayTurn);
                c.style.cursor = "not-allowed";
            });
            return "Game is over";
        }

        document.getElementById("page-title").innerText = "Au tour du joueur " + convertIntToColor(ge.currentPlayingPlayer.color);
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

    let giveUpButton = document.getElementById("button-abandon");
    giveUpButton.addEventListener("click", function () {
        ge.getOtherPlayer();
        ge.isGameOver = true;
        showWinner(ge);
    });

    function convertIntToColor(color) {
        if (color === "1") {
            return "Jaune";
        } else if (color === "2") {
            return "Rouge";
        } else {
            throw new Error("Invalid color");
        }
    }
}

document.getElementById("page-title").innerText = "Au tour du joueur Jaune";
let wpi = new WebPageInteraction(ge)
