"use strict";

import {Position} from "../../GameLogic/Position.js";
import Grid from "../../GameLogic/Grid.js";
import {PARAMETER_NAME_IA_PLAYS} from "./constant.js";
import {drawPopUp} from "../../templates/popUp/play/drawPopUp.js";
import {winningPopUp} from "../../templates/popUp/play/winningPopUp.js";
import {losingPopUp} from "../../templates/popUp/play/losingPopUp.js";
import {drawVibration, losingVibration, winningVibration} from "../../templates/cordova/vibrationsTypes.js";
import {BASE_URL_PAGE} from "../../util/frontPath.js";
import {HOME_URL} from "../../util/path.js";

const gameSocket = io("/api/game", {auth: {token: localStorage.getItem("token")}});
let grid = new Grid(7, 6);

let toPlay;
let colorPlayer;
let colorOtherPlayer;

let hasGivenUp = false;

function WebPageInteraction() {
    const redDiscCSSClass = "red-disc";
    const yellowDiscCSSClass = "yellow-disc";

    this.updateWebPageGrid = function (column, row, color) {
        let cell = document.getElementById(column + "-" + row);

        const discAbove = document.createElement("div");
        discAbove.classList.add("fall");
        discAbove.id = cell.id + "n";
        if (color === Grid.redCellValue) {
            discAbove.classList.add(redDiscCSSClass);
        } else {
            discAbove.classList.add(yellowDiscCSSClass);
        }
        cell.appendChild(discAbove);
    }

    this.webPagePlayTurn = function (event) {
        let elemId = event.target.id;
        if (event.target.id.includes("n")) {
            elemId = event.target.id.substring(0, event.target.id.length - 1);
        }
        let clickCoords = elemId.split("-");
        let column = clickCoords[1];
        let row = clickCoords[0];
        play(column, row);
    }
    // Constructor -----------------------------------------------------------------------------------------------------
    this.addListeners = function () {
        for (let column = 0; column < grid.width; column++) {
            for (let line = 0; line < grid.height; line++) {
                let cell = document.getElementById(column + "-" + line);
                cell.setAttribute("value", Grid.defaultCellValue);
                cell.style.cursor = "pointer";
                cell.addEventListener("click", this.webPagePlayTurn);
            }
        }
    }

    let giveUpButton = document.getElementById("give-up-button");
    giveUpButton.addEventListener("click", function () {
        if (!hasGivenUp) {
            gameSocket.emit("giveUp");
            hasGivenUp = true;
        } else {
            losingPopUp();
            changeInfoPage("Défaite");
            losingVibration();
        }
    });

    let quitButton = document.getElementById("quit-button");
    quitButton.addEventListener("click", () => {
        window.location.replace(BASE_URL_PAGE + HOME_URL);
    });

    this.addListeners();


}

function removeListeners() {
    document.querySelectorAll(".grid-item").forEach(c => {
        c.removeEventListener("click", wpi.webPagePlayTurn);
        c.style.cursor = "not-allowed";
    });
}

let wpi = new WebPageInteraction()

let setupAI = function (AIplayTurn) {
    if (AIplayTurn !== 1 && AIplayTurn !== 2) {
        throw new Error("the value " + AIplayTurn + " of AIplay for the setup is invalid")
    }

    if (AIplayTurn === 1) {
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

    gameSocket.emit("setup", {AIplays: AIplayTurn})
}

let play = function (clickRow, clickColumn) {
    let column = clickColumn;
    let row = grid.getRowOfLastDisk(column);

    // emit the event of the play not working yet
    gameSocket.emit("newMove", [+column, +row]);
    return new Position(column, row)
}

const url = new URL(window.location.href);
let AITurn = url.searchParams.get(PARAMETER_NAME_IA_PLAYS);

if (AITurn === null) {
    AITurn = 2;
}

function changeInfoPage(text) {
    document.getElementById("info").innerText = text;
    document.getElementById("page-title").innerText = "";
}

gameSocket.on("connect", () => {
    setupAI(+AITurn);

    gameSocket.on("updatedBoard", globalCoordsGrid => {
        let move = grid.findMove(globalCoordsGrid.board)
        grid.cells = globalCoordsGrid.board

        // the client has to play
        if (toPlay) {
            // premier updateGrid, le joueur doit don jouer
            // deuxième updateGrid reçu après l'exécution de l'évènement newMove, il faut update lka grille
            wpi.updateWebPageGrid(move.column, move.row, colorPlayer)
            removeListeners();
            document.getElementById("page-title").innerText = "Au tour de l'adversaire";
        } else {
            // the client just receive the confirmation of its move
            wpi.updateWebPageGrid(move.column, move.row, colorOtherPlayer)
            wpi.addListeners();
            document.getElementById("page-title").innerText = "A ton tour";
        }
        toPlay = !toPlay;
    })

    gameSocket.on("gameIsOver", (winner) => {
        if (winner === "draw") {
            drawPopUp();
            changeInfoPage("Egalité");
            drawVibration();
        } else {
            if (winner === "HumanPlayer") {
                winningPopUp();
                changeInfoPage("Victoire");
                winningVibration()

            } else {
                losingPopUp();
                changeInfoPage("Défaite");
                losingVibration();
            }
        }
        removeListeners();
    });

    gameSocket.on("playError", (Error) => {
        console.log("playError received:", Error)
    });
});

export {PARAMETER_NAME_IA_PLAYS}




