import {MongoClient} from "mongodb";

import {DB_CONF} from "./conf/mongodb.conf";

this.#client = new MongoClient(DB_CONF.mongodbUri);
try {
    await this.#client.connect();
    this.#database = this.#client.db(DB_CONF.dbName);
    this.#users = this.#database.collection(DB_CONF.userCollection);
} catch (error) {
    console.error(error);
}
await this.#users.insertOne(data);
