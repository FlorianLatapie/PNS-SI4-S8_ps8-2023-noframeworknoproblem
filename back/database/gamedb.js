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

    async addGame(data) {
        await this.verifyConnection();
        try {
            if (!await this.existsGameGameEngineId(data)) {
                return await this.games.insertOne(data);
            } else {
                return await this.games.updateOne({gameId: data.gameId}, {$set: data});
            }
        } catch (error) {
            console.error(error);
        }

        throw new Error("Game already exists :" + JSON.stringify(data))
    }

    async getGamePlayerId(player) {
        await this.verifyConnection();
        try {
            let game = await this.games.findOne({$or: [{player1: player}, {player2: player}]});
            if (game) {
                if (game.gameEngine.isGameOver) {
                    await this.removeGame(game.gameId);
                    return null;
                }
            }
            return game;
        } catch (error) {
            throw new Error("Game not found for player: " + player + error);
        }
    }

    async existsGameGameEngineId(data) {
        await this.verifyConnection();
        try {
            return await this.games.findOne({gameId: data.gameId}) !== null;
        } catch (error) {
            console.error(error);
        }
    }

    async removeGame(id) {
        await this.verifyConnection();
        try {
            return await this.games.deleteMany({gameId: id});
        } catch (error) {
            console.error(error);
        }
    }

    async getAllGames() {
        await this.verifyConnection();
        try {
            return await this.games.find({}).toArray();
        } catch (error) {
            console.error(error);
        }
    }

    async removeAllGames() {
        await this.verifyConnection();
        try {
            return await this.games.deleteMany({});
        } catch (error) {
            console.error(error);
        }
    }
}

export default new GameDb();
