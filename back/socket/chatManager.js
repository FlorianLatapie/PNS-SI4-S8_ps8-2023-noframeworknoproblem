import chatdb from "../database/chatdb.js";

class chatManager {
    #user1;
    #user2;

    constructor(chatSocket, user1, user2) {
        this.#user1 = user1;
        this.#user2 = user2;
    }

    addMessage = async (message) => {
        chatdb.addMessage(this.#user1, this.#user2, message)
            .catch((err) => {
                console.log(err);
            });
    }

    getMessages = async () => {
        return await chatdb.getMessages(this.#user1, this.#user2)
            .catch((err) => {
                console.log(err);
            });
    }

    readMessages = async () => {
        chatdb.readMessages(this.#user1, this.#user2)
            .catch((err) => {
                console.log(err);
            });
    }

    getLastMessage = async () => {
        return await chatdb.getLastReceivedMessage(this.#user1, this.#user2)
            .catch((err) => {
                console.log(err);
            });
    }
}

export default chatManager;
