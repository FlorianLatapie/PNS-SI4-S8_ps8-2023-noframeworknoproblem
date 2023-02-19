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
        console.log("Searching for user: ", data)
        this.users.find({}).toArray().then(o => console.log(o));
        try {
            user = await this.users.findOne({username: data.username, password: data.password});
            console.log("User with username: ", user);
            if (user === null) {
                user = await this.users.findOne({mail: data.username, password: data.password});
            }
            console.log("User with mail: ", user)
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
            const sameUserName = await this.users.findOne({username: data.username});
            const sameEmail = await this.users.findOne({mail: data.mail});
            //console.log("User db: ", sameUserName, sameEmail);
            return !(sameUserName === null && sameEmail === null);
        } catch (error) {
            console.error(error);
        }
    }
}

export default new UserDb();
