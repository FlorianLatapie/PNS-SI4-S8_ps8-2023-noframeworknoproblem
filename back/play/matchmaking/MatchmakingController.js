import matchmakingRoomInstances from "./OnlineRoomInstances.js";
import PlayersQueue from "./PlayersQueue.js";

// TODO : enlever playersConnected qui est redondant avec ConnectedPlayers
class MatchmakingController {
    constructor(gameSocket, playersConnected) {
        this.gameSocket = gameSocket;
        this.playersConnected = playersConnected;
        this.matchmakingRoomInstances = matchmakingRoomInstances;
        this.playersQueue = new PlayersQueue(gameSocket);
    }

    newConnection(player) {
        // If a player is already connected, we don't add him to the queue
        player.removeAllListeners();
        if (this.playersConnected.isPlayerConnected(player.userId)) {
            this.gameSocket.to(player.id).emit("alreadyConnected");
            this.playersConnected.removePlayer(player.userId);
            player.disconnect();
            return;
        }

        this.handlePlayerDisconnection(player);

        // Else we need to check if he wasn't in a game to reconnect him
        if (this.matchmakingRoomInstances.isPlayerPlaying(player)) {
            this.matchmakingRoomInstances.reconnectPlayer(player);
            return;
        }

        this.playersConnected.addPlayer(player);
        this.playersQueue.addPlayer(player);
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
            this.playersConnected.removePlayer(player.userId);
            console.log('user ' + player.id + ' disconnected');
        });
    }
}

export default MatchmakingController;
