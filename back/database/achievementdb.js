"use strict";

import {MongoClient} from "mongodb";

import DB_CONF from "../conf/mongodb.conf.js";

class AchievementDb {
    constructor() {
        this.client = new MongoClient(DB_CONF.mongodbUri);
    }

    async connect() {
        try {
            await this.client.connect();
            this.database = this.client.db(DB_CONF.dbName);
            this.achievements = this.database.collection(DB_CONF.achievementsCollection + "");
        } catch (error) {
            console.error(error);
        }
    }

    async verifyConnection() {
        if (typeof this.achievements !== 'undefined') return;
        await this.connect();
    }

    async addAchievement(userId, achievementId, progress, obtained) {
        if (!this.isAchievementValid(achievementId)) throw new Error("Invalid achievement id: " + achievementId)

        console.log("Adding achievement: ", achievementId, " for user: ", userId)
        await this.verifyConnection()
        try {
            if (!await this.existsAchievementForThisUser(userId, achievementId)) {
                return await this.achievements.insertOne({userId, achievementId, progress, obtained})
            } else {
                return await this.achievements.updateOne({userId, achievementId}, {$set: {progress, obtained}})
            }
        } catch (error) {
            console.error(error);
        }

        throw new Error("Achievement already exists for this user :" + JSON.stringify({userId, achievementId}))
    }

    async existsAchievementForThisUser(userId, achievementId) {
        await this.verifyConnection();
        try {
            return await this.achievements.findOne({userId, achievementId}) !== null;
        } catch (error) {
            console.error(error);
        }
    }

    async getAchievementsForUser(userId) {
        await this.verifyConnection();
        try {
            return await this.achievements.find({userId}).toArray();
        } catch (error) {
            console.error(error);
        }
    }

    async removeAllAchievements() {
        await this.verifyConnection();
        try {
            return await this.achievements.deleteMany({});
        } catch (error) {
            console.error(error);
        }
    }

    getAllPossibleAchievements() {
        return {
            "1stGame": {
                "friendlyName": "Première partie", "description": "Joue ta première partie", "maxProgress": 1,
            },
            "10Games": {
                "friendlyName": "10 parties", "description": "Joue 10 parties", "maxProgress": 10,
            },
            "konami": {
                "friendlyName": "Code Konami", "description": "Utilise le code Konami", "maxProgress": 1,
            }
        }
    }

    isAchievementValid(achievementId) {
        return Object.keys(this.getAllPossibleAchievements()).includes(achievementId);
    }
}

export default new AchievementDb();