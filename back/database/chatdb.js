import {MongoClient} from "mongodb";

import DB_CONF from "../conf/mongodb.conf.js";

class ChatDb {
    constructor() {
        this.client = new MongoClient(DB_CONF.mongodbUri);
    }

    async connect() {
        try {
            await this.client.connect();
            this.database = this.client.db(DB_CONF.dbName);
            this.chats = this.database.collection(DB_CONF.chatsCollection+"");
        } catch (error) {
            console.error(error);
        }
    }

    async verifyConnection() {
        if (typeof this.chats !== 'undefined') return;
        await this.connect();
    }

    async addMessage(idSender, idReceiver, message){
        await this.verifyConnection();
        try {
            this.chats.insertOne({
                idSender: idSender,
                idReceiver: idReceiver,
                message: message,
                read: false,
                sentDate: new Date(),
            });
        } catch (error) {
            console.error(error);
        }
    }

    //TODO: changer pour récupérer seulement X messages
    async getMessages(idSender, idReceiver, numberMessagesToGet, numberMessagesToSkip) {
        await this.verifyConnection();
        try {
            return await this.chats.find({
                $or: [
                    {idSender: idSender, idReceiver: idReceiver},
                    {idSender: idReceiver, idReceiver: idSender}
                ].sort({sentDate: -1}).skip(numberMessagesToSkip).limit(numberMessagesToGet)
            }).toArray();
        } catch (error) {
            console.error(error);
        }
    }

    async readMessages(idSender, idReceiver){
        await this.verifyConnection();
        try {
            this.chats.updateMany({
                idSender: idSender,
                idReceiver: idReceiver,
                read: false
            }, {
                $set: {
                    read: true
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    async getLastReceivedMessage(idSender, idReceiver){
        await this.verifyConnection();
        try {
            return await this.chats.find({
                idSender: idSender,
                idReceiver: idReceiver,
                read: false
            }).sort({sentDate: -1}).limit(1).toArray();
        } catch (error) {
            console.error(error);
        }
    }

}

export default new ChatDb();
