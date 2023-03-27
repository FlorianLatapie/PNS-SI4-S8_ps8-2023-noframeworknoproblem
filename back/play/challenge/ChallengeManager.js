/* This class is responsible to store the challenges send by players
** It is composed of a map with as key the id of the player who send the challenge (socket_sender)
* and as value of a player who received the challenge (id_receiver)
* The value of the map is a simple id and not an array because a player can only send one challenge at a time
 */
class ChallengeManager {

    #challenges
    constructor() {
        this.#challenges = new Map();
    }

    newChallenge(socket_sender, id_receiver) {
        this.#challenges.set(socket_sender, id_receiver);
    }

    removeChallenge(id_sender) {
        this.#challenges.delete(id_sender);
    }

    acceptChallenge(id_receiver, id_sender) {
        if (this.#challenges.has(id_sender) && this.#challenges.get(id_sender) === id_receiver) {
            this.removeChallenge(id_sender);
            return true;
        }
        return false;
    }

    hasSentChallenge(id_sender) {
        return this.#challenges.has(id_sender);
    }
}

export default new ChallengeManager();
