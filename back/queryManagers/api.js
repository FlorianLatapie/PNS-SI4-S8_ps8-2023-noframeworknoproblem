"use strict";

// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.

import {BODY, PARAMS, sendResponse, urlNotFound} from "./utilsApi.js";
import {userLogIn, userSignUp} from "./user/accountApi.js";
import {achievementsManager} from "./user/userAchievements.js";
import {friendsApiGet, friendsApiDelete, friendsApiPost} from "./friends/apiFriends.js";
import {usersApiGet} from "./user/usersApiGet.js";
import {notificationsApiGet} from "./notification/apiNotifications.js";

function manageRequest(request, response) {
    addCors(response)

    let url = request.url.split("?")
    let urlPathArray = url[0].split("/")

    console.log("URL Path Array before removing informations: ", urlPathArray)
    removeUselessInformationsUrlPathArray(urlPathArray)
    console.log("URL Path Array after removing informations: ", urlPathArray)
    retrieveParamsQuery(request)

    if (request.method === 'OPTIONS') {
        sendResponse(response, 200, "OK");
    } else if (request.method === "POST") {
        let body = "";
        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function () {
            putBodyInRequest(request, body)

            // parse the url and use the right function
            switch (urlPathArray[0]) {
                case "signup":
                    userSignUp(request, response);
                    break;
                case "login":
                    // need to search the user in the database and check error
                    userLogIn(request, response);
                    break;
                case "achievements":
                    urlPathArray.shift()
                    achievementsManager(request, response, urlPathArray);
                    break;
                case "friends":
                    urlPathArray.shift()
                    friendsApiPost(request, response, urlPathArray);
                    break;
                default:
                    console.log("URL", url, "not supported");
                    sendResponse(response, 404, "URL " + url + " not supported");
                    break;
            }
        });
    } else if (request.method === "GET") {
        switch (urlPathArray[0]) {
            case "friends":
                urlPathArray.shift()
                friendsApiGet(request, response, urlPathArray);
                break;
            case "users":
                urlPathArray.shift()
                usersApiGet(request, response, urlPathArray);
                break;
            case "notifications":
                urlPathArray.shift()
                notificationsApiGet(request, response, urlPathArray);
                break;
        }
    } else if (request.method === "PUT") {
        switch (urlPathArray[0]) {
            default:
                urlNotFound(request, response)
        }

    } else if (request.method === "DELETE") {
        switch (urlPathArray[0]) {
            case "friends":
                urlPathArray.shift()
                friendsApiDelete(request, response, urlPathArray);
                break;
            default:
                urlNotFound(request, response)
        }
    } else {
        console.log("Method", request.method, "not supported");
        sendResponse(response, 404, "Method " + request.method + " not supported");
    }
}


/* For the url http://localhost:8000/api/login the urlPathArray is ["", "api", "login"].
** For the url http://localhost:8000/api/login/ the urlPathArray is ["", "api", "login", ""].
** This method removes the first and last element of the array if they are empty strings.
* For instance, the url http://localhost:8000/api/login/ and http://localhost:8000/api/login and  will become ["login"].
 */
function removeUselessInformationsUrlPathArray(urlPathArray) {
    if (urlPathArray[0] === "") {
        urlPathArray.shift();
    }

    if (urlPathArray[0] === "api") {
        urlPathArray.shift();
    }

    if (urlPathArray[urlPathArray.length - 1] === "") {
        urlPathArray.pop();
    }
}

// A POST request may contain a body. This body is stored in the request object at the key "body".
// If the body cannot be parsed as a JSON, it is interpreted as an empty object.
function putBodyInRequest(request, body) {
    try {
        request[BODY] = JSON.parse(body);
    } catch (err) {
        request[BODY] = {};
    }
}

// Params query are stored in the request object at the key "params"
function retrieveParamsQuery(request) {
    let url = request.url.split("?")

    let paramsObject = {}
    if (url.length === 2) {
        let urlParams = url[1].split("&");
        urlParams.forEach(param => {
            const [key, value] = param.split("=")
            if (value !== undefined) {
                paramsObject[key] = value
            }
        })
    }

    request[PARAMS] = paramsObject;
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

