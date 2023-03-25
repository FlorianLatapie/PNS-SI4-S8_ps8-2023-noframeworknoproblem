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
            this.notifications = this.database.collection(DB_CONF.notificationCollection);
        } catch (error) {
            console.error(error);
        }
    }

    async verifyConnection() {
        if (typeof this.notifications !== 'undefined') return;
        await this.connect();
    }

    // TODO : need to test this function
    async addNotification(userId, notification) {
        await this.verifyConnection();
        const query = {userId: userId};
        const update = {notifications: notification};
        return await this.notifications.insertOne(query, update);
    }

    async getNotifications(userId, numberNotificationsToGet, numberNotificationsToSkip) {
        await this.verifyConnection();
        const query = {userId: userId};
        const projection = {_id: 1, notification: 1};
        return await this.notifications.find(query, projection).sort({date: -1}).skip(numberNotificationsToSkip).limit(numberNotificationsToGet);
    }

    async deleteNotification(notificationId) {
        await this.verifyConnection();
        const result = await this.notifications.deleteOne({_id: notificationId})
        // if result.deletedCount === 0, the notification was not deleted, otherwise 1 it was deleted
        return result.deletedCount;
    }

    createNewNotificationObject(userId, notification) {
        let obj = {
            userId: userId,
            // friends of the user
            notification,
            date: Date.now(),
        }
        return obj;
    }

}

export default new GameDb();
