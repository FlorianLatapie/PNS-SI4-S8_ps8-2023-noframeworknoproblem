export default class User {
    static schemaSignUp = {
        username: 'string',
        email: 'string',
        password: 'string'
    }

    static schemaLoginUsername = {
        usernameOrEmail: 'string',
        password: 'string'
    }

   static convertSignUp(data) {
        return User.convertData(data, User.schemaSignUp);
   }

   static convertLogin(data) {
        return User.convertData(data, User.schemaLoginUsername);
   }

   static convertData(data, schema) {
        let user = {};
       for (const key in data) {
           console.log("Convert Data: key ", key);
           if (!data.hasOwnProperty(key)) {
               console.log("Convert Data: data doesn't have key ", key, data);
               throw Error("Invalid data");
           }

           if (typeof data[key] !== typeof schema[key]) {
               console.log("Convert Data: data type doesn't match schema type ", key, data);
               console.log(typeof data[key], typeof schema[key]);
               throw Error("Invalid data");
           }
           user[key] = data[key];
       }
       return user;
   }
}
