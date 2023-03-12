// Class to manage the players waiting to enter a game
// the queue contains the socket object of the players
import {MatchmakingRoom} from "./room/MatchmakingRoom.js";
import MatchmakingRoomInstances from "./MatchmakingRoomInstances.js";

class PlayersQueue {
  constructor(gameSocket, matchmakingRoomInstances) {
    this.queue = [];
    this.gameSocket = gameSocket;
    this.matchmakingRoomInstances = matchmakingRoomInstances;
  }

  addPlayer = (player) => {
      if (this.queue.length === 0) {
          this.queue.push(player);
          player.to(player.id).emit("waitingForOpponent");
          console.log(`The player : ${player.username} (id : ${player.userId}) is waiting for an opponent`);
      } else {
          let otherPlayer = this.queue.pop();
          let matchm = new MatchmakingRoom(otherPlayer, player, this.gameSocket, this.matchmakingRoomInstances);
            this.matchmakingRoomInstances.newGame(otherPlayer, player, matchm);
          console.log(`Game is starting between ${otherPlayer.username} (id : ${otherPlayer.userId}) and ${player.username} (id : ${player.userId})`);
      }
  }

  removePlayer = (playerId) => {
      // need to check the structure of a socket
    this.queue = this.queue.filter((p) => p.userId !== playerId);
  }

  isPlayerInQueue = (playerId) => {
    return this.queue.some((p) => p.userId === playerId);
  }

  isPlayerPlaying = (playerId) => {
    return MatchmakingRoomInstances.getInstance().isPlayerPlaying(playerId);
  }
}

export default PlayersQueue;
