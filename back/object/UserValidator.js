import {sha256} from "js-sha256";

export default class UserValidator {
    static schema = {
        username: 'string', mail: 'string', password: 'string'
    }

    static convertSignUp(data) {
        let user = UserValidator.hashPassword(UserValidator.convertData(data, UserValidator.schema));
        if (user.username.length > 16 ||user.username.length === 0) {
            throw new Error(`The length of username field ${user.username.length} is invalid, should be between 1 and 16`)
        }

        if (!UserValidator.validateEmail(user.mail)) {
            throw new Error(`The email field ${user.mail} is invalid`)
        }
        return user;
    }

    static convertLogin(data) {
        return UserValidator.hashPassword(UserValidator.convertData(data, UserValidator.schema));
    }

    static hashPassword(data) {
        data.password = sha256(data.password)
        return data;
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

    static validateEmail(email) {
        const re = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
        return re.test(String(email).toLowerCase());
    }
}
