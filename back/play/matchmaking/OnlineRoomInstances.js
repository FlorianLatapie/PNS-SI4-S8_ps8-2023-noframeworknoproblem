// Class to manage the players playing
// the map contains as keys the id of the players and as a value the instance of the OnlineRoom associated to the player
class OnlineRoomInstances {

    constructor() {
        this.players = new Map()
    }

    newGame(player1, player2, matchMakingRoom) {
        this.players.set(player1.userId, matchMakingRoom);
        this.players.set(player2.userId, matchMakingRoom);
        // console.log("New game entered in the map ", this.players)
    }

    removePlayer(player) {
        this.players.delete(player.userId)
    }

    isPlayerPlaying(player) {
        return this.players.has(player.userId);
    }

    getRoom(player) {
        return this.players.get(player.userId);
    }

    gameFinished(player1, player2) {
        this.removePlayer(player1);
        this.removePlayer(player2);
        console.log("New game finished in the map ", this.players)
    }

    // need to do something
    reconnectPlayer(player) {
        this.getRoom(player).reconnectPlayer(player);
    }

}

export default new OnlineRoomInstances();
