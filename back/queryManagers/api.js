// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.

import userdb from "../database/userdb.js";
import jwt from 'jsonwebtoken';
import User from "../object/User.js";

// TODO need to be changed
let secretCode = "secretCode";

function manageRequest(request, response) {
    addCors(response)

    let url = request.url.split("?")
    let urlPath = url[0].split("/")
    let urlParams = (urlPath.length === 2) ? url[1].split("&") : undefined;

    // C'est dans la correction de Vella à voir si c'est utile
    if (request.method === 'OPTIONS') {
        sendResponse(response, 200, "OK");
    } else if (request.method === "POST") {
        let body = "";
        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function () {
            // sanitize the body
            if (body === "") {
                sendResponse(response, 404, "Bad request : no body");
                return;
            }

            let bodyJson
            try {
                bodyJson = JSON.parse(body);
            } catch (err) {
                sendResponse(response, 404, "Bad request : body is not a valid JSON")
                return;
            }

            // parse the url and use the right function
            if (urlPath[2] === "signup" || urlPath[2] === "signin") {
                userSignUp(request, response, bodyJson);
            } else if (urlPath[2] === "login") {
                // need to search the user in the database and check error
                userLogIn(request, response, bodyJson);
            } else {
                console.log("URL", url, "not supported");
                sendResponse(response, 404, "URL " + url + " not supported");
            }
        });
    } else {
        console.log("Method", request.method, "not supported");
        sendResponse(response, 404, "Method " + request.method + " not supported");
    }
}

function sendResponse(response, statusCode, message) {
    response.statusCode = statusCode;
    response.end(message);
}

function userSignUp(request, response, data) {
    let user;
    try {
        user = User.convertSignUp(data);
    } catch (err) {
        console.log("User not created:", err);
        sendResponse(response, 400, "The object user is malformed " + JSON.stringify(err));
    }

    console.log("Adding the user:", user);
    userdb.addUser(user).then((userCreated) => {
        // Everything went well, we can send a response.
        console.log("User added: ", userCreated);
        sendResponse(response, 201, "OK");
    }).catch((err) => {
        console.log("User not added: ", err);
        sendResponse(response, 409, "User not created: " + JSON.stringify(err));
    });
}

function userLogIn(request, response, data) {
    // need to search the user in the database and check error
    let user;
    try {
        user = User.convertLogin(data);
    } catch (err) {
        console.log("User not found ", err);
        sendResponse(response, 404, "User not found: " + JSON.stringify(err));
    }

    userdb.getUser(user).then((userFound) => {
        console.log("User found: ", userFound);
        // Returns a Json Web Token containing the name. We know this token is an acceptable proof of
        // identity since only the server know the secretCode.
        let payload = {
            userId: userFound._id.toString(),
            username: userFound.username
        };

        let token = jwt.sign(payload, secretCode, {expiresIn: "1d"})
        sendResponse(response, 200, token);
    }).catch((err) => {
        console.log("User not found: ", err);
        sendResponse(response, 404, "User not found: " + JSON.stringify(err));
    });

}

/* This method is a helper in case you stumble upon CORS problems. It shouldn't be used as-is:
** Access-Control-Allow-Methods should only contain the authorized method for the url that has been targeted
** (for instance, some of your api urls may accept GET and POST request whereas some others will only accept PUT).
** Access-Control-Allow-Headers is an example of how to authorize some headers, the ones given in this example
** are probably not the ones you will need. */
function addCors(response) {
    // Website you wish to allow to connect to your server.
    response.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow.
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow.
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent to the API.
    response.setHeader('Access-Control-Allow-Credentials', true);
}

//exports.manage = manageRequest;
// error ReferenceError: exports is not defined in ES module scope
// convert it to avoid this error
export {manageRequest as manage};

