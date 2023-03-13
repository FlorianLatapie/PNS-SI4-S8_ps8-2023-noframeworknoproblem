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
            this.achievements = this.database.collection(DB_CONF.achievementsCollection+"");
            // TODO: understand why it's necessary to add +"" to the collection name
        } catch (error) {
            console.error(error);
        }
    }

    async verifyConnection() {
        if (typeof this.achievements !== 'undefined') return;
        await this.connect();
    }

    async addAchievement(userId, achievementId){
        console.log("Adding achievement: ", achievementId, " for user: ", userId)
        await this.verifyConnection()
        try{
            if (!await this.existsAchievementForThisUser(userId, achievementId)){
                return await this.achievements.insertOne({userId, achievementId})
            } else {
                return await this.achievements.updateOne({userId, achievementId}, {$set: {userId, achievementId}})
            }
        } catch (error) {
            console.error(error);
        }

        return new Error("Achievement already exists for this user :" +  JSON.stringify({userId, achievementId}))
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
}

export default new AchievementDb();