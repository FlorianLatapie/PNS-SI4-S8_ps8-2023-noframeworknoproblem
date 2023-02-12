import {MongoClient} from "mongodb";

import DB_CONF from "../conf/mongodb.conf.js";

class GameDb {
    constructor() {
        this.client = new MongoClient(DB_CONF.mongodbUri);
    }

    async connect() {
        try {
            await this.client.connect();
            this.database = this.client.db(DB_CONF.dbName);
            this.games = this.database.collection(DB_CONF.gameCollection);
        } catch (error) {
            console.error(error);
        }
    }

    async verifyConnection() {
        if (typeof this.games !== 'undefined') return;
        await this.connect();
    }

    async addGamePath(data) {
        await this.verifyConnection();
        try {
            if (!await this.existsGameGameEngineId(data)) {
                console.log("Game doesn't exist, adding game");
                return await this.games.insertOne(data);
            } else {
                console.log("Game already exists, doing nothing");
                return
            }
        } catch (error) {
            console.error(error);
        }

        return new Error("Game already exists :" +  JSON.stringify(data))
    }

    async getGamePlayerId(player) {
        await this.verifyConnection();
        let game;
        try {
            game = await this.games.findOne({$or: [{player1: player}, {player2: player}]});
        } catch (error) {
            console.error(error);
        }
        return game;
    }

    async existsGameGameEngineId(data) {
        await this.verifyConnection();
        try {
            //console.log("Checking if game exists: ", data.gameId)
            return await this.games.findOne({gameId: data.gameId}) !== null;
        } catch (error) {
            console.error(error);
        }
    }

    async removeGame(data) {
        await this.verifyConnection();
        try {
            return await this.games.deleteOne({id: data.id});
        } catch (error) {
            console.error(error);
        }
    }
}

export default new GameDb();