import Grid from "../GameLogic/Grid.js";
import {parseJwt} from "../util/jwtParser.js";
import {winningPopUp} from "../templates/popUp/play/winningPopUp.js";
import {losingPopUp} from "../templates/popUp/play/losingPopUp.js";
import {drawPopUp} from "../templates/popUp/play/drawPopUp.js";
import {informativePopUp} from "../templates/popUp/informativePopUp/informativePopUp.js";

class WebPageInteractionPVP {

    #grid
    #socket;

    #redDiscCSSClass = "red-disc";
    #yellowDiscCSSClass = "yellow-disc";

    #muteFlag;

    #chatOpponentTmpTimer;
    #chatPlayerTmpTimer;

    constructor(grid) {
        this.#muteFlag = false;
        this.#grid = grid;
        console.log("WebPageInteractionPVP constructor grid ", grid)
        this.addAllListeners();
        this.#addChatListeners();
    }

    setSocket = (socketMatchmaking) => {
        this.#socket = socketMatchmaking;
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
    }

    removeAllListeners = () => {
        this.removeGridListeners();
        this.removeGiveUpListener();
    }

    #addChatListeners = () => {
        this.#tempChatListener();
        this.#muteButtonListener();
        this.#clickChatButtonsListener();
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
        this.#socket.giveUpEmit();
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
        this.#socket.newMoveEmit(column, row);
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
        this.#changeTitlePage("En attente d'un adversaire");
    }
    #changeTitlePage = (title) => {
        document.getElementById("page-title").innerText = title;
    }

    #changeInfoPage = (info) => {
        document.getElementById("info").innerText = info;
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

    #muteButtonListener = () => {
        document.getElementById("mute").addEventListener("click", () => {
            this.#muteFlag = !this.#muteFlag;

            if (this.#muteFlag) {
                console.log("muteFlag is true");
                document.getElementById("mute").src = "../../images/unmute.svg";
                document.getElementById("chat-temp-button").style.visibility = "hidden";
                document.getElementById("all-message-container").style.visibility = "hidden";
            } else {
                console.log("muteFlag is false");
                document.getElementById("mute").src = "../../images/mute.svg";
                document.getElementById("chat-temp-button").style.visibility = "visible";
            }
        });
    }

    #tempChatListener = () => {
        console.log("tempChatListener executed")
        let tempChat = document.getElementById("chat-temp-button");
        tempChat.style.cursor = "pointer";
        document.getElementById("all-message-container").style.visibility = "hidden";
        tempChat.addEventListener("click", () => {
            const chat = document.getElementById("all-message-container");
            if (chat.style.visibility === "hidden") {
                chat.style.visibility = "visible";
            } else {
                chat.style.visibility = "hidden";
            }
        });
    }


    #clickChatButtonsListener = () => {
        let bulles = document.getElementsByClassName("send");
        Array.from(bulles).forEach(bulle => {
            bulle.addEventListener("click", () => {
                this.#emitMessage(bulle);
                this.updateChatPlayer(bulle.getElementsByClassName("message")[0].textContent);
            });
        });
    }

    #emitMessage = (bulle) => {
        //console.log("message to send", bulle.childNodes[1].childNodes[1].textContent);
        this.#socket.chatEmit(bulle.getElementsByClassName("message")[0].textContent);
    }



    updateChatOpponent = (message) => {
        if (!this.#muteFlag) {
            let opponent_message = document.getElementById("opponent-message-container");
            if (this.#chatOpponentTmpTimer) {
                clearTimeout(this.#chatOpponentTmpTimer);
            }
            this.#chatOpponentTmpTimer = setTimeout(() => {
                opponent_message.style.visibility = "hidden";
            }, 5000);
            document.getElementById("opponent-message").innerText = message;
            opponent_message.style.visibility = "visible";
        }
    }

    updateChatPlayer = (message) => {
        if (!this.#muteFlag) {
            let player_message = document.getElementById("player-message-container");
            if (this.#chatPlayerTmpTimer) {
                clearTimeout(this.#chatPlayerTmpTimer);
            }
            this.#chatPlayerTmpTimer = setTimeout(() => {
                player_message.style.visibility = "hidden";
            }, 5000);
            document.getElementById("player-message").innerText = message;
            player_message.style.visibility = "visible";
        }
    }

    displayOpponent = (opponent) => {
        this.#changeTitlePage("Adversaire : " + opponent.name + " (ELO : )"); //TODO récupérer l'ELO
    }

    opponentLeaved = () => {
        this.#changeInfoPage("L'adversaire a quitté la partie");
        informativePopUp("L'adversaire a quitté la partie");
    }

    waitingForOpponent = (username) => {
        this.#changeTitlePage("En attente de l'adversaire : " + username);
    }
}

export default WebPageInteractionPVP;
