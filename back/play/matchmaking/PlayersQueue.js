// Class to manage the players waiting to enter a game
// the queue contains the socket object of the players
import {OnlineRoom} from "../room/OnlineRoom.js";
import matchmakingRoomInstances from "./OnlineRoomInstances.js";

class PlayersQueue {

    #queue;
    #gameSocket;
    #matchmakingRoomInstances;

    constructor(gameSocket) {
        this.#queue = [];
        this.#gameSocket = gameSocket;
        this.#matchmakingRoomInstances = matchmakingRoomInstances;
    }

    addPlayer = (player) => {
        if (this.#queue.length === 0) {
            this.#queue.push(player);
            this.#gameSocket.to(player.id).emit("waitingForOpponent");
        } else {
            let otherPlayer = this.#queue.pop();
            let matchm = new OnlineRoom(otherPlayer, player, this.#gameSocket);
            this.#matchmakingRoomInstances.newGame(otherPlayer, player, matchm);
        }
    }

    removePlayer = (playerId) => {
        // need to check the structure of a socket
        const player = this.#queue.map(p => p.userId).indexOf(playerId);
        if (player > -1) {
            this.#queue.splice(player, 1);
        } else {
            console.log("ERROR : Player not found in the queue");
        }
        //console.log("players removed in queue : ", this.#queue.length, this.#queue.map((p) => p.userId));
    }

    isPlayerInQueue = (playerId) => {
        return this.#queue.some((p) => p.userId === playerId);
    }
}

export default PlayersQueue;
