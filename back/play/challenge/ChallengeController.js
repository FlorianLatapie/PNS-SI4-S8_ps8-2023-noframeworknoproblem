import challengeManager from "./ChallengeManager.js";
import onlineRoomInstances from "../matchmaking/OnlineRoomInstances.js";
import {OnlineRoom} from "../room/OnlineRoom.js";
import frienddb from "../../database/frienddb.js";
import SendNotifications from "../../socket/SendNotifications.js";

// TODO : need  to handle you can send challenge to only connected friends
class ChallengeController {
    #gameSocket;
    #connectedPlayers;

    constructor(gameSocket, connectedPlayers) {
        this.#gameSocket = gameSocket;
        this.#connectedPlayers = connectedPlayers;
    }

    challengeRequest(player, id_receiver) {
        // If a player is already connected, we don't add him to the queue
        player.removeAllListeners();

        if (this.#connectedPlayers.isPlayerConnected(player.userId)) {
            this.#gameSocket.to(player.id).emit("alreadyConnected");
            this.#connectedPlayers.removePlayer(player.userId);
            player.disconnect();
            return;
        }

        // If the player has already sent a challenge, we don't went to add him
        if (challengeManager.hasSentChallenge(player.userId)) {
            this.#gameSocket.to(player.id).emit("alreadyConnected");
            this.#connectedPlayers.removePlayer(player.userId);
            player.disconnect();
            return;
        }

        this.#connectedPlayers.addPlayer(player);
        this.handlePlayerDisconnection(player);

        // need to check the id of the receiver is valid and it is a friend
        frienddb.isInFriends(player.userId, id_receiver).then(() => {
            // add the challenge to the challenge manager
            challengeManager.newChallenge(player.userId, id_receiver);
            SendNotifications.sendNotificationChallengeRequest(id_receiver, player.userId, player.username);
        }).catch((err) => {
            this.#gameSocket.to(player.id).emit("error", err + "");
        });
    }

    challengeAccepted(player, id_challenge_sender) {
        player.removeAllListeners();
        console.log("Player accepting challenge ", player.userId);

        if (this.#connectedPlayers.isPlayerConnected(player.userId)) {
            console.log(`The player : ${player.username} (id : ${player.userId}) is already connected`);
            this.#gameSocket.to(player.id).emit("alreadyConnected");
            this.#connectedPlayers.removePlayer(player.userId);
            player.disconnect();
            return;
        }

        if (!challengeManager.acceptChallenge(player.userId, id_challenge_sender)) {
            this.#gameSocket.to(player.id).emit("invalidChallenge", "The challenge is not valid");
            this.#connectedPlayers.removePlayer(player.userId);
            player.disconnect();
            return;
        }

        this.#connectedPlayers.addPlayer(player);

        this.handlePlayerDisconnection(player);

        let otherPlayer = this.#connectedPlayers.getSocketPlayer(id_challenge_sender);
        let onlineRoom = new OnlineRoom(otherPlayer, player, this.#gameSocket);
        onlineRoomInstances.newGame(otherPlayer, player, onlineRoom);
    }

    handlePlayerDisconnection = (player) => {
        player.on('disconnect', () => {
            console.log(`The player : ${player.username} (id : ${player.userId}) leaved challenge waiting room`);
            challengeManager.removeChallenge(player.userId);
            this.#connectedPlayers.removePlayer(player.userId);
        });
    }
}

export default ChallengeController;
