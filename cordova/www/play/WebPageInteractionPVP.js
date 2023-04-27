import Grid from "../GameLogic/Grid.js";
import {parseJwt} from "../util/jwtParser.js";
import {winningPopUp} from "../templates/popUp/play/winningPopUp.js";
import {losingPopUp} from "../templates/popUp/play/losingPopUp.js";
import {drawPopUp} from "../templates/popUp/play/drawPopUp.js";
import {informativePopUp} from "../templates/popUp/informativePopUp/informativePopUp.js";
import {BASE_URL_API, BASE_URL_PAGE} from "../util/frontPath.js";
import {API_URL, HOME_URL, STATS_API} from "../util/path.js";
import {drawVibration, losingVibration, winningVibration} from "../templates/cordova/vibrationsTypes.js";

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
        this.addAllListeners();
        this.#addChatListeners();
    }

    setSocket = (socketMatchmaking) => {
        this.#socket = socketMatchmaking;
    }

    updateWebPageGrid = (column, row, color) => {
        let cell = document.getElementById(column + "-" + row);

        const discAbove = document.createElement("div");
        discAbove.classList.add("fall");
        discAbove.id = cell.id + "n";
        if (color === Grid.redCellValue) {
            discAbove.classList.add(this.#redDiscCSSClass);
        } else {
            discAbove.classList.add(this.#yellowDiscCSSClass);
        }
        cell.appendChild(discAbove);
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
        let elemId = event.target.id;
        if (event.target.id.includes("n")) {
            elemId = event.target.id.substring(0, event.target.id.length - 1);
        }
        let clickCoords = elemId.split("-");
        let column = clickCoords[1];
        let row = clickCoords[0];
        this.play(column, row); // need to send something via the socket
    }

    addAllListeners = () => {
        this.#gridListener();
        this.#giveUpListener();
        this.#quitListener();
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
        let giveUpButton2 = document.getElementById("give-up-button2");
        giveUpButton2.addEventListener("click", this.#clickGiveUpButton);
    }

    #clickGiveUpButton = () => {
        this.#socket.giveUpEmit();
    }

    #quitListener = () => {
        let quitButton = document.getElementById("quit-button");
        quitButton.addEventListener("click", this.#clickQuitButton);
        let quitButton2 = document.getElementById("quit-button2");
        quitButton2.addEventListener("click", this.#clickQuitButton);
    }

    #clickQuitButton = () => {
        window.location.replace(BASE_URL_PAGE + HOME_URL);
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
        let giveUpButton2 = document.getElementById("give-up-button2");
        giveUpButton2.removeEventListener("click", this.#clickGiveUpButton);
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
            drawVibration();
            this.#changeInfoPage("Egalité");
        } else {
            if (winner === parseJwt(localStorage.getItem("token")).username) {
                winningPopUp();
                winningVibration()
                this.#changeInfoPage("Victoire");
            } else {
                losingPopUp();
                losingVibration();
                this.#changeInfoPage("Défaite");
            }
        }
        this.removeAllListeners();
    }

    alreadyConnectedMessage = () => {
        const text = "Tu possèdes déjà une connexion en cours"
        this.#changeTitlePage(text);
        informativePopUp(text);
    }

    updateTimer = (time, boolean) => {
        if (boolean) {
            document.getElementById("timer").innerText = "Temps restant pour toi 0:0" + time / 1000;
        } else {
            document.getElementById("timer").innerText = "Temps restant pour l'adversaire 0:0" + time / 1000;
        }
    }

    #muteButtonListener = () => {
        document.getElementById("mute").addEventListener("click", () => {
            this.#muteFlag = !this.#muteFlag;

            if (this.#muteFlag) {
                document.getElementById("mute").src = BASE_URL_PAGE + "images/unmute.svg";
                document.getElementById("chat-temp-button").style.visibility = "hidden";
                document.getElementById("all-message-container").style.visibility = "hidden";
                document.getElementById("chat-buttons").style.background = "none";
            } else {
                document.getElementById("mute").src = BASE_URL_PAGE + "images/mute.svg";
                document.getElementById("chat-temp-button").style.visibility = "visible";
                document.getElementById("chat-buttons").style.background = "#f5f5f5";
            }
        });
    }

    #tempChatListener = () => {
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
        let stats = fetch(BASE_URL_API + API_URL + STATS_API + "getAll/" + opponent.id, {
            method: 'get', headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            if (!response.ok) {
                throw new Error("Error while calling API" + response.status)
            }
            return response.json();
        }).then((object) => {
            return object;
        }).catch(error => {
            console.log(error);
        });

        stats.then((object) => {
            this.#changeTitlePage("Adversaire : " + opponent.name + " (ELO : " + object.elo + ")");
        });
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
