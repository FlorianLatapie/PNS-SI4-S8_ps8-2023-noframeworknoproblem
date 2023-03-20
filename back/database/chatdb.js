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
            });
        } catch (error) {
            console.error(error);
        }
    }

    async getMessages(idSender, idReceiver){
        await this.verifyConnection();
        try {
            return await this.chats.find({
                $or: [
                    {idSender: idSender, idReceiver: idReceiver},
                    {idSender: idReceiver, idReceiver: idSender}
                ]
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

}

export default new ChatDb();
