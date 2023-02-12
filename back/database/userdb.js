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
        if (typeof this.users !== 'undefined') return;
        await this.connect();
    }

    async addUser(data) {
        await this.verifyConnection();
        try {
            if (! await this.existsUser(data)) {
                console.log("User doesn't exist, adding user");
                return await this.users.insertOne(data);
            }
        } catch (error) {
            console.error(error);
        }

        return new Error("User already exists")
    }

    async getUser(data) {
        await this.verifyConnection();
        let user;
        try {
            user = await this.users.findOne({username: data.usernameOrEmail, password: data.password});
            if (user === null) {
                user = await this.users.findOne({email: data.usernameOrEmail, password: data.password});
            }
        } catch (error) {
            console.error(error);
        }

        if (user === null) {
            throw new Error("User" + user + "not found while searching for :" + data);
        }
        return user;
    }

    async existsUser(data) {
        await this.verifyConnection();
        try {
            //console.log("Checking if user exists: ", data.username, data.email)
            const sameUserName = await this.users.findOne({username: data.username});
            const sameEmail = await this.users.findOne({email: data.email});
            //console.log("User db: ", sameUserName, sameEmail);
            return !(sameUserName === null && sameEmail === null);
        } catch (error) {
            console.error(error);
        }
    }
}

export default new UserDb();
