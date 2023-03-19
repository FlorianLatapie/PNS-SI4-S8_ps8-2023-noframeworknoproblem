"use strict";

// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.

import {sendResponse} from "./util.js";
import {userSignUp, userLogIn} from "./user/accountApi.js";
import {achievementsManager, addAchievements} from "./user/userAchievements.js";
import friendsApi from "./friends/apiFriends.js";
import {validateJwt} from "../auth/jwtParserBack.js";
import {usersApi} from "./user/usersApi.js";

function manageRequest(request, response) {
    addCors(response)

    let url = request.url.split("?")
    let urlPath = url[0].split("/")

    let paramsObject = {}
    if (urlPath.length === 2) {
        let urlParams = url[1].split("&");
        urlParams.forEach(param => {
            const [key, value] = param.split("=")
            paramsObject[key] = value
        })
    } else {
        paramsObject = undefined;
    }

    // C'est dans la correction de Vella à voir si c'est utile
    if (request.method === 'OPTIONS') {
        sendResponse(response, 200, "OK");
    } else if (request.method === "POST") {
        if (urlPath.length < 3) {
            sendResponse(response, 404, "URL " + url + " not supported");
            return;
        }
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

            // try to parse the body as a JSON
            let bodyJson
            try {
                bodyJson = JSON.parse(body);
            } catch (err) {
                sendResponse(response, 404, "Bad request : body is not a valid JSON")
                return;
            }

            // parse the url and use the right function
            switch (urlPath[2]) {
                case "signup":
                    userSignUp(request, response, bodyJson);
                    break;
                case "login":
                    // need to search the user in the database and check error
                    userLogIn(request, response, bodyJson);
                    break;
                case "achievements":
                    achievementsManager(url, urlPath, request, response, bodyJson);
                    break;

                default:
                    console.log("URL", url, "not supported");
                    sendResponse(response, 404, "URL " + url + " not supported");
                    break;

            }
        });
    } else if (request.method === "GET") {
        if (urlPath.length < 3) {
            sendResponse(response, 404, "URL " + url + " not supported");
            return;
        }

        if (request.headers.authorization === undefined || request.headers.authorization.split(" ")[0] !== "Bearer") {
            sendResponse(response, 401, "Unauthorized");
            return;
        }

        let userToken = request.headers.authorization.split(" ")[1];

        console.log("Before validation of the Authorization header")
        let userIdEmitTheRequest;
        try {
            userIdEmitTheRequest = validateJwt(userToken).userId;
        } catch (err) {
            sendResponse(response, 401, "Unauthorized  : " + err);
            return;
        }

        console.log("After validation of the Authorization header")

        switch (urlPath[2]) {
            case "friends":
                friendsApi(urlPath, userIdEmitTheRequest, response, paramsObject);
                break;
            case "users":
                usersApi(urlPath, userIdEmitTheRequest, response, paramsObject);
                break;
        }
    } else {
        console.log("Method", request.method, "not supported");
        sendResponse(response, 404, "Method " + request.method + " not supported");
    }
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

