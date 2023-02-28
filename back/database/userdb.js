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

        throw new Error("User already exists")
    }

    // if the user has a username and an email, it will only use the username
    async getUser(data) {
        await this.verifyConnection();
        let user;
        console.log("Searching for user: ", data)

        // our front only send the property username, but it can be the username or the email
        if (data.hasOwnProperty("username")) {
            try {
                user = await this.users.findOne({username: data.username, password: data.password});
                if (user === null) {
                    user = await this.users.findOne({mail: data.username, password: data.password});
                }
            } catch (error) {
                console.error(error);
            }

            if (user === null) {
                throw new Error("User" + user + "not found while searching for :" + data);
            }
            return user;
        }

        // for to be conformed with the api
        if (data.hasOwnProperty("mail")) {
            try {
                user = await this.users.findOne({mail: data.mail, password: data.password});
            } catch (error) {
                console.error(error);

            }

            if (user === null) {
                throw new Error("User" + user + "not found while searching for :" + data);
            }
            return user;
        }
    }

    async existsUser(data) {
        await this.verifyConnection();
        try {
            const sameUserName = await this.users.findOne({username: data.username});
            const sameEmail = await this.users.findOne({mail: data.mail});
            //console.log("UserValidator db: ", sameUserName, sameEmail);
            return !(sameUserName === null && sameEmail === null);
        } catch (error) {
            console.error(error);
        }
    }
}

export default new UserDb();
