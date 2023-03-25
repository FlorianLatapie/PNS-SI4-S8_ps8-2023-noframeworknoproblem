import {MongoClient} from "mongodb";

import DB_CONF from "../conf/mongodb.conf.js";

class FriendDb {
    constructor() {
        this.client = new MongoClient(DB_CONF.mongodbUri);
    }

    async connect() {
        try {
            await this.client.connect();
            this.database = this.client.db(DB_CONF.dbName);
            this.friends = this.database.collection(DB_CONF.friendsCollection + "");
        } catch (error) {
            console.error(error);
        }
    }

    async verifyConnection() {
        // TODO : need to check if the connection is not already active (if (typeof this.friends !== 'undefined') return;) wasn't working
        await this.connect();
    }

    async addFriends(userID, friendID) {
        this.checkEqualityUserIds(userID, friendID);
        await this.verifyConnection();

        // test conditions and recover the object from the database
        console.log("addFriends ", userID, friendID)
        let [userObject, friendObject] = await Promise.all([
            this.isInPending(userID, friendID), this.isInRequests(friendID, userID)]);

        console.log("addFriends ", userObject, friendObject)
        userObject.friends.push(friendID);
        userObject.pending = userObject.pending.filter((user) => user !== friendID)

        console.log("userObject modifications ", userObject)
        friendObject.friends.push(userID);
        friendObject.requests = friendObject.requests.filter((user) => user !== userID)
        console.log("friendObject modifications ", friendObject)

        // put the object in the database
        let objUpdateUser = {
            $set: {
                friends: userObject.friends,
                pending: userObject.pending,
            }
        }

        let objUpdateFriend = {
            $set: {
                friends: friendObject.friends,
                requests: friendObject.requests,
            }
        }

        console.log("Before sending promise ")

        await Promise.all([
            await this.friends.updateOne({userId: userID}, objUpdateUser),
            await this.friends.updateOne({userId: friendID}, objUpdateFriend)
        ]);

        console.log("After sending promise ")
    }

    async addPending(userID, friendID) {
        this.checkEqualityUserIds(userID, friendID);

        await this.verifyConnection();
        let objectInDB = await this.recoverFriendWithInit(userID);

        console.log("addPending objectInDB", objectInDB)
        if (objectInDB.pending.includes(friendID)) {
            throw new Error(userID + " have already pending from " + friendID);
        } else if (objectInDB.friends.includes(friendID)) {
            throw new Error(userID + " is already friend with " + friendID);
        }

        objectInDB.pending.push(friendID);
        const updateDocument = {
            $set: {
                pending: objectInDB.pending,
            },
        };

        await this.friends.updateOne({userId: userID}, updateDocument);
    }

    async addRequest(userID, friendID) {
        this.checkEqualityUserIds(userID, friendID);

        await this.verifyConnection();
        let objectInDB = await this.recoverFriendWithInit(userID);
        console.log("addRequest objectInDB", objectInDB)
        if (objectInDB.requests.includes(friendID)) {
            throw new Error(userID + " have already request from " + friendID);
        } else if (objectInDB.friends.includes(friendID)) {
            throw new Error(userID + " is already friend with " + friendID);
        }

        objectInDB.requests.push(friendID);
        const updateDocument = {
            $set: {
                requests: objectInDB.requests,
            },
        };

        await this.friends.updateOne({userId: userID}, updateDocument);
    }

    async getRequests(userID) {
        await this.verifyConnection();
        let objectInDB = await this.recoverFriendWithInit(userID);
        return objectInDB.requests;
    }

    async getFriends(userID) {
        await this.verifyConnection();
        let objectInDB = await this.recoverFriendWithInit(userID);
        return objectInDB.friends;
    }

    async getPending(userID) {
        await this.verifyConnection();
        let objectInDB = await this.recoverFriendWithInit(userID);
        return objectInDB.pending;
    }

    async isInRequests(userID, friendID) {
        await this.verifyConnection();
        let objectInDB = await this.recoverFriendWithInit(userID);
        console.log("isInRequests objectInDB", objectInDB)
        if (!objectInDB.requests.includes(friendID)) {
            throw new Error("Friend request from " + friendID + " not found for " + userID);
        }
        return objectInDB;
    }

    async isInPending(userID, friendID) {
        await this.verifyConnection();
        let objectInDB = await this.recoverFriendWithInit(userID);
        console.log("isInPending objectInDB", objectInDB)
        if (!objectInDB.pending.includes(friendID)) {
            throw new Error("Friend pending from " + friendID + " not found for " + userID);
        }
        return objectInDB;
    }

    async isInFriends(userID, friendID) {
        await this.verifyConnection();
        let objectInDB = await this.recoverFriendWithInit(userID);
        if (!objectInDB.friends.includes(friendID)) {
            throw new Error("Friend " + friendID + " not found for " + userID);
        }
        return objectInDB;
    }

    async removeFriend(userID, friendID) {
        await this.verifyConnection();
        await Promise.all([
            this.removeFriendInternal(userID, friendID),
            this.removeFriendInternal(friendID, userID),
        ]);
    }

    async removeRequest(userID, friendID) {
        await this.verifyConnection();
        await Promise.all([
            this.removeRequestInternal(userID, friendID),
            this.removePendingInternal(friendID, userID)
        ]);
    }

    async removePending(userID, friendID) {
        await this.verifyConnection();
        await Promise.all([
            this.removePendingInternal(userID, friendID),
            this.removeRequestInternal(friendID, userID)
        ]);
    }

    async removeFriendInternal(userID, friendID) {
        await this.verifyConnection();
        let objectInDB = await this.recoverFriendWithInit(userID);
        let newPendingParams = objectInDB.friends.filter((friend) => friend !== friendID)

        if (objectInDB.friends.length === newPendingParams.length) {
            throw new Error(userID + " is not friend with " + friendID);
        }

        const updateDocument = {
            $set: {
                friends: newPendingParams,
            },
        };

        await this.friends.updateOne({userId: userID}, updateDocument);
    }

    async removePendingInternal(userID, friendID) {
        await this.verifyConnection();
        let userInDB = await this.recoverFriendWithInit(userID);

        let newPendingParams = userInDB.pending.filter((friend) => friend !== friendID)
        if (userInDB.pending.length === newPendingParams.length) {
            throw new Error(userID + " is not pending with " + friendID);
        }

        const updateUser = {
            $set: {
                pending: newPendingParams,
            },
        };

        await this.friends.updateOne({userId: userID}, updateUser);
    }

    async removeRequestInternal(userID, friendID) {
        await this.verifyConnection();
        let userInDB = await this.recoverFriendWithInit(userID);

        let newRequestsParams = userInDB.requests.filter((friend) => friend !== friendID)

        if (userInDB.requests.length === newRequestsParams.length) {
            throw new Error(userID + " is not pending with " + friendID);
        }

        const updateUser = {
            $set: {
                requests: newRequestsParams,
            },
        };

        await this.friends.updateOne({userId: userID}, updateUser);
    }

    async getElementFromDB(userID) {
        await this.verifyConnection();
        // recover the object from the database
        return await this.friends.findOne({userId: userID});
    }

    async recoverFriendWithInit(userID) {
        await this.verifyConnection();
        let objectInDB = await this.getElementFromDB(userID);
        if (objectInDB === null) {
            objectInDB = await this.createNewFriendObject(userID);
        }
        return objectInDB;
    }

    async createNewFriendObject(userID) {
        let obj = {
            userId: userID,
            // friends of the user
            friends: [],
            // pending friend requests for the user
            pending: [],
            // requests sent by the user
            requests: []
        }

        let resBD = await this.friends.insertOne(obj);
        obj["_id"] = resBD["_id"];
        return obj;
    }

    checkEqualityUserIds(userID, friendID) {
        if (userID === friendID) {
            throw new Error("Cannot add yourself as a friend");
        }
    }
}

export default new FriendDb();
