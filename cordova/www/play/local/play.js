"use strict";

import Player from "../../GameLogic/Player.js";
import GameEngine from "../../GameLogic/GameEngine.js";
import Grid from "../../GameLogic/Grid.js";
import {drawPopUp} from "../../templates/popUp/play/drawPopUp.js";
import {winningPopUp} from "../../templates/popUp/play/winningPopUp.js";
import {drawVibration, winningVibration} from "../../templates/cordova/vibrationsTypes.js";
import {BASE_URL_PAGE} from "../../util/frontPath.js";
import {HOME_URL} from "../../util/path.js";

let p1 = new Player("Jaune", 0)
let p2 = new Player("Rouge", 1)
let ge = new GameEngine(p1, p2, "I am a local game engine", false)

function WebPageInteraction() {
    this.cells = ge.grid.cells;

    const redDiscCSSClass = "red-disc";
    const yellowDiscCSSClass = "yellow-disc";

    function changeInfoPage(text) {
        let title = document.getElementById("page-title");
        title.innerText = text;
    }

    function showWinner(gameState) {
        let winner = gameState.winner;
        if (winner === "draw") {
            drawPopUp();
            drawVibration();
            changeInfoPage("Egalité");
        } else {
            winningPopUp();
            winningVibration()
            if (winner === undefined) {
                winner = gameState.currentPlayingPlayer.name;
            }
            changeInfoPage("Le joueur " + winner + " a gagné !");
        }
    }

    this.webPagePlayTurn = function () {
        let elemId = this.id;
        if (this.id.includes("n")) {
            elemId = this.id.substring(0, this.id.length - 1);
        }
        let clickCoords = elemId.split("-");
        let column = clickCoords[0];
        let row = ge.grid.getRowOfLastDisk(column);
        let cell = document.getElementById(column + "-" + row);

        // play turn changes the current player, so we need to get the other player for the next lines of code
        let gameState = ge.playTurn(ge.currentPlayingPlayer, clickCoords[0]);

        const discAbove = document.createElement("div");
        discAbove.classList.add("fall");
        discAbove.id = cell.id + "n";
        if (ge.getOtherPlayer().color === Grid.redCellValue) {
            discAbove.classList.add(redDiscCSSClass);
        } else {
            discAbove.classList.add(yellowDiscCSSClass);
        }
        cell.appendChild(discAbove);

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

    let giveUpButton = document.getElementById("give-up-button");

    function giveUp() {
        ge.getOtherPlayer();
        ge.isGameOver = true;
        showWinner(ge);
    }

    giveUpButton.addEventListener("click", giveUp);

    let quitButton = document.getElementById("quit-button");
    quitButton.addEventListener("click", () => {
        window.location.replace(BASE_URL_PAGE + HOME_URL);
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
