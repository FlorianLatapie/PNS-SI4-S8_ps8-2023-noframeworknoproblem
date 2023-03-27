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
        console.log("new connection player ", player);
        if (this.playersConnected.isPlayerConnected(player.userId)) {
            console.log(`The player : ${player.username} (id : ${player.userId}) is already connected`);
            this.gameSocket.to(player.id).emit("alreadyConnected");
            this.playersConnected.removePlayer(player.userId);
            player.disconnect();
            return;
        }

        this.handlePlayerDisconnection(player);

        // Else we need to check if he wasn't in a game to reconnect him
        console.log(`new connection ${this.matchmakingRoomInstances.isPlayerPlaying(player)}`);
        console.log(this.matchmakingRoomInstances.players)
        if (this.matchmakingRoomInstances.isPlayerPlaying(player)) {
            console.log(`The player : ${player.username} (id : ${player.userId}) is reconnecting to a game`);
            this.matchmakingRoomInstances.reconnectPlayer(player);
            return;
        }

        console.log(`The player : ${player.username} (id : ${player.userId}) is connected`);
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
