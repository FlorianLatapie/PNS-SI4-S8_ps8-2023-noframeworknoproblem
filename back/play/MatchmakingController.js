import {MatchmakingRoom} from "./room/MatchmakingRoom.js";
import matchmakingRoomInstances from "./MatchmakingRoomInstances.js";
import PlayersQueue from "./PlayersQueue.js";

class MatchmakingController {
    constructor(gameSocket) {
        this.gameSocket = gameSocket;
        this.playersConnected = [];
        this.matchmakingRoomInstances = new matchmakingRoomInstances();
        this.playersQueue = new PlayersQueue(gameSocket, this.matchmakingRoomInstances);
    }

    newConnection(player) {
        // If a player is already connected, we don't add him to the queue
        player.removeAllListeners();
        if (this.isPlayerConnected(player)) {
            console.log(`The player : ${player.username} (id : ${player.userId}) is already connected`);
            player.disconnect();
            return;
        }
        this.playersConnected.push(player);

        // Else we need to check if he wasn't in a game to reconnect him
        console.log(`new connection ${this.matchmakingRoomInstances.isPlayerPlaying(player)}`);
        console.log(this.matchmakingRoomInstances.players)
        if (this.matchmakingRoomInstances.isPlayerPlaying(player)) {
            console.log(`The player : ${player.username} (id : ${player.userId}) is reconnecting to a game`);
            this.matchmakingRoomInstances.reconnectPlayer(player);
            return;
        }

        console.log(`The player : ${player.username} (id : ${player.userId}) is connected`);
        this.playersQueue.addPlayer(player);
        this.handlePlayerDisconnection(player);
    }

    isPlayerConnected(player) {
        return this.playersConnected.some((p) => p.userId === player.userId);
    }

    handlePlayerDisconnection = (player) => {
        player.on('disconnect', () => {
            if (this.playersQueue.isPlayerInQueue(player.userId)) {
                this.playersQueue.removePlayer(player.userId);
                console.log(`The player : ${player.username} (id : ${player.userId}) removed from the queue`);
            } else if (this.matchmakingRoomInstances.isPlayerPlaying(player.userId)) {
                // nothing special to do here
                console.log(`The player : ${player.username} (id : ${player.userId}) disconnect when he was in a game`);
            }
            this.playersConnected = this.playersConnected.filter((p) => p.userId !== player.userId);
            console.log('user ' + player.id + ' disconnected');
        });
    }
}

export default MatchmakingController;
