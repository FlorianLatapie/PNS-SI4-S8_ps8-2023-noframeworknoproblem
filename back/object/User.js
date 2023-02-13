export default class User {
    static schema = {
        username: 'string', mail: 'string', password: 'string'
    }

    static convertSignUp(data) {
        return User.convertData(data, User.schema);
    }

    static convertLogin(data) {
        return User.convertData(data, User.schema);
    }

    static convertData(data, schema) {
        let user = {};
        for (const key in data) {
            if (!data.hasOwnProperty(key)) {
                console.log("Convert Data: data doesn't have key ", key, data);
                throw Error("Invalid data");
            }

            if (typeof data[key] !== typeof schema[key]) {
                console.log("Convert Data: data type doesn't match schema type ", key, "is type", typeof data[key], "and should be type", typeof schema[key]);
                console.log(typeof data[key], typeof schema[key]);
                throw Error("Invalid data");
            }
            user[key] = data[key];
        }
        return user;
    }
}
