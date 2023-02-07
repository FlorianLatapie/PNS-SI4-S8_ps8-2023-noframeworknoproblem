import {MongoClient} from "mongodb";

import DB_CONF from "../conf/mongodb.conf.js";

class UserDb {
    constructor() {
        this.client = new MongoClient(DB_CONF.mongodbUri);
    }

    async connect() {
        try {
            await this.client.connect();
            this.database = this.client.db(DB_CONF.dbName);
            this.users = this.database.collection(DB_CONF.userCollection);
        } catch (error) {
            console.error(error);
        }
    }

    async verifyConnection() {
        if (typeof this.client !== 'undefined') return;
        await this.connect();
    }

    async addUser(data) {
        // TODO vérifier que l'utilisateur n'existe pas déjà
        await this.verifyConnection();
        try {
            await this.users.insertOne(data);
        } catch (error) {
            console.error(error);
        }
    }

    async getUser(data) {
        await this.verifyConnection();
        try {
            return await this.users.findOne(data);
        } catch (error) {
            console.error(error);
        }
    }

    async existsUser(data) {
        await this.verifyConnection();
        try {
            const user = await this.users.findOne(data);
            return typeof user !== 'undefined' && user !== null;
        } catch (error) {
            console.error(error);
        }
    }

}


export default new UserDb();
