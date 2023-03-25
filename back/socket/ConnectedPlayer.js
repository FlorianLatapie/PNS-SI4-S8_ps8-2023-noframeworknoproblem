class ConnectedPlayer {

    #mapPlayers
    constructor() {
        this.#mapPlayers = new Map();
    }

    // player is a socket
    addPlayer(player) {
        this.#mapPlayers.set(player.userId, player);
    }

    isPlayerConnected(playerId) {
        return this.#mapPlayers.has(playerId);
    }

    removePlayer(playerId) {
        this.#mapPlayers.delete(playerId);
    }

    getSocketPlayer(playerId) {
        return this.#mapPlayers.get(playerId);
    }

    // TODO : Need to check because I am not sure if it works like that
    sendToPlayer(playerId, event, data) {
        this.#mapPlayers.get(playerId).emit(event, data);
    }
}

export default new ConnectedPlayer();
