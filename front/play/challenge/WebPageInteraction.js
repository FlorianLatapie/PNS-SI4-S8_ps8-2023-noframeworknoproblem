import Grid from "../../GameLogic/Grid.js";
import {parseJwt} from "../../util/jwtParser.js";
import {informativePopUp} from "../../templates/popUp/informativePopUp/informativePopUp.js";
import {drawPopUp} from "../../templates/popUp/play/drawPopUp.js";
import {winningPopUp} from "../../templates/popUp/play/winningPopUp.js";
import {losingPopUp} from "../../templates/popUp/play/losingPopUp.js";

class WebPageInteraction {
    #grid
    #socketChallenge;

    #redDiscCSSClass = "red-disc";
    #yellowDiscCSSClass = "yellow-disc";

    #muteFlag;

    constructor(grid) {
        this.#grid = grid;
        this.#muteFlag = false;
        console.log("WebPageInteraction constructor grid ", grid)
        this.addAllListeners();

        document.getElementById("mute").addEventListener("click", () => {
            this.#muteFlag = !this.#muteFlag;

            if (this.#muteFlag) {
                console.log("muteFlag is true");
                document.getElementById("mute").src = "../../images/unmute.svg";
                document.getElementById("tempChat").style.visibility = "hidden";
            } else {
                console.log("muteFlag is false");
                document.getElementById("mute").src = "../../images/mute.svg";
                document.getElementById("tempChat").style.visibility = "visible";
            }
        });
    }

    setSocketMatchmaking = (socketMatchmaking) => {
        this.#socketChallenge = socketMatchmaking;
    }

    updateWebPageGrid = (column, row, color) => {
        let cell = document.getElementById(column + "-" + row);

        cell.classList.add("fall");
        if (color === Grid.redCellValue) {
            cell.classList.add(this.#redDiscCSSClass);
        } else {
            cell.classList.add(this.#yellowDiscCSSClass);
        }
    }

    updateWebPageEntireGrid = (grid) => {
        for (let column = 0; column < grid.width; column++) {
            for (let line = grid.height - 1; line >= 0; line--) {
                let pos = grid.getGlobalPosition(column, line)

                let cell = document.getElementById(pos.column + "-" + pos.row);
                if (grid.cells[line][column] === Grid.redCellValue) {
                    cell.classList.add(this.#redDiscCSSClass);
                } else if (grid.cells[line][column] === Grid.yellowCellValue) {
                    cell.classList.add(this.#yellowDiscCSSClass);
                } else {
                    break;
                }
            }
        }
    }

    webPagePlayTurn = (event) => {
        let clickCoords = event.target.id.split("-");
        let column = clickCoords[1];
        let row = clickCoords[0];
        this.play(column, row); // need to send something via the socket
    }

    addAllListeners = () => {
        this.#gridListener();
        this.#giveUpListener();
        this.#tempChatListener();
    }

    removeAllListeners = () => {
        this.removeGridListeners();
        this.removeGiveUpListener();
    }

    #gridListener = () => {
        for (let column = 0; column < this.#grid.width; column++) {
            for (let line = 0; line < this.#grid.height; line++) {
                let cell = document.getElementById(column + "-" + line);
                cell.setAttribute("value", Grid.defaultCellValue);
                cell.style.cursor = "pointer";
                cell.addEventListener("click", this.webPagePlayTurn);
            }
        }
    }

    #giveUpListener = () => {
        let giveUpButton = document.getElementById("give-up-button");
        giveUpButton.addEventListener("click", this.#clickGiveUpButton);
    }

    #clickGiveUpButton = () => {
        this.#socketChallenge.giveUpEmit();
    }

    removeGridListeners = () => {
        document.querySelectorAll(".grid-item").forEach(c => {
            c.removeEventListener("click", this.webPagePlayTurn);
            c.style.cursor = "not-allowed";
        });
    }

    removeGiveUpListener = () => {
        let giveUpButton = document.getElementById("give-up-button");
        giveUpButton.removeEventListener("click", this.#clickGiveUpButton);
    }

    play = (clickRow, clickColumn) => {
        let column = clickColumn;
        let row = this.#grid.getRowOfLastDisk(column);
        this.#socketChallenge.newMoveEmit(column, row);
    }

    playerPlay = (column, row, color) => {
        this.updateWebPageGrid(column, row, color);
        this.removeGridListeners();
        this.otherPlayerTurnMessage();
        document.getElementById("timer").innerText = "Temps restant pour l'adversaire 0:10";
    }

    otherPlayerPlay = (column, row, color) => {
        this.updateWebPageGrid(column, row, color);
        this.addAllListeners();
        this.playerTurnMessage();
        document.getElementById("timer").innerText = "Temps restant pour toi 0:10";
    }

    reconnectPlayerTurn = () => {
        this.playerTurnMessage();
        this.addAllListeners();
    }

    reconnectOtherPlayerTurn = () => {
        this.otherPlayerTurnMessage();
        this.removeGridListeners();
    }

    playerTurnMessage = () => {
        this.#changeInfoPage("A ton tour");
    }

    otherPlayerTurnMessage = () => {
        this.#changeInfoPage("Au tour de l'adversaire");
    }

    waitingForOtherPlayerMessage = () => {
        this.#changeTitlePage("En attente de l'adversaire");
    }
    #changeTitlePage = (title) => {
        document.getElementById("page-title").innerText = title;
    }

    gameIsOver = (winner) => {
        if (winner === "draw") {
            drawPopUp();
            this.#changeInfoPage("Egalité");
        } else {
            if (winner === parseJwt(localStorage.getItem("token")).username) {
                winningPopUp();
                this.#changeInfoPage("Victoire");
            } else {
                losingPopUp();
                this.#changeInfoPage("Défaite");
            }
        }
        this.removeAllListeners();
    }

    alreadyConnectedMessage = () => {
        this.#changeTitlePage("Tu possèdes déjà une connexion en cours");
    }

    updateTimer = (time, boolean) => {
        if(boolean){
            document.getElementById("timer").innerText = "Temps restant pour toi 0:0" + time / 1000;
        }
        else{
            document.getElementById("timer").innerText = "Temps restant pour l'adversaire 0:0" + time / 1000;
        }
    }

    #tempChatListener = () => {
        let tempChat = document.getElementById("tempChat");
        tempChat.style.cursor = "pointer";
        tempChat.addEventListener("click", this.#clickChatButton);
    }


    #clickChatButton = () => {
        let bulles = document.getElementsByClassName("send");
        if(bulles[0].style.visibility === "hidden"){
            for (let i = 0; i < bulles.length; i++) {
                bulles[i].style.visibility = "visible";
                bulles[i].style.cursor = "pointer";
                bulles[i].addEventListener("click", () => {
                    this.#emitMessage(bulles[i]);
                });
            }
        }
        else{
            for (let i = 0; i < bulles.length; i++) {
                bulles[i].style.visibility = "hidden";
                bulles[i].style.cursor = "default"
                bulles[i].removeEventListener("click", () => {
                    this.#emitMessage(bulles[i].childNodes[1].childNodes[1].textContent);
                });
            }
        }

    }

    #emitMessage = (bulle) => {
        //console.log("message to send", bulle.childNodes[1].childNodes[1].textContent);
        this.#socketChallenge.chatEmit(bulle.childNodes[1].childNodes[1].textContent);
        bulle.style.visibility = "hidden";
    }

    updateChat = (message) => {
        if (!this.#muteFlag) {
            let chat = document.getElementById("chatTest");
            setTimeout(() => {
                chat.style.visibility = "hidden";
            }, 5000);
            chat.childNodes[1].childNodes[1].childNodes[0].textContent = message;
            chat.style.visibility = "visible";
        }
    }

    opponentLeaved = () => {
        this.#changeInfoPage("L'adversaire a quitté la partie");
        informativePopUp("L'adversaire a quitté la partie");
    }

    waitingForOpponent = (username) => {
        this.#changeTitlePage("En attente de l'adversaire " + username);
    }

    displayOpponent = (opponentUsername) => {
        this.#changeTitlePage("Adversaire : " + opponentUsername);
    }

    #changeInfoPage = (info) => {
        document.getElementById("info").innerText = info;
    }
}

export default WebPageInteraction;
