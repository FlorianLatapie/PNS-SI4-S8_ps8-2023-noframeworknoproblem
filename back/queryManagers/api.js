"use strict";

// code is sorted by request type (GET, POST, DELETE, PUT, OPTIONS)

import {BODY, PARAMS, sendResponse, urlNotFound} from "./utilsApi.js";
import {userLogIn, userSignUp} from "./user/accountApi.js";
import {achievementsManager} from "./user/userAchievements.js";
import {friendsApiGet, friendsApiDelete, friendsApiPost} from "./friends/apiFriends.js";
import {usersApiGet} from "./user/usersApi.js";
import {notificationsApiDelete, notificationsApiGet} from "./notification/apiNotifications.js";
import {messagesApiGet} from "./chat/apiChats.js";
import {
    ACHIEVEMENTS_API,
    CHATS_API,
    FRIENDS_API,
    LOGIN_API,
    NOTIFICATIONS_API,
    SIGNUP_API,
    STATS_API,
    USERS_API
} from "../../cordova/www/util/path.js";
import {userStatsGet} from "./user/userStats.js";

function manageRequest(request, response) {
    addCors(response)

    let url = request.url.split("?")
    let urlPathArray = url[0].split("/")

    removeUselessInformationsUrlPathArray(urlPathArray)

    retrieveParamsQuery(request)

    switch (request.method) {
        case "OPTIONS":
            sendResponse(response, 200, "OK");
            break;
        case "POST":
            let body = "";
            request.on('data', function (data) {
                body += data;
            });

            request.on('end', function () {
                putBodyInRequest(request, body)

                switch (urlPathArray[0] + "/") {
                    case SIGNUP_API:
                        userSignUp(request, response);
                        break;
                    case LOGIN_API:
                        userLogIn(request, response);
                        break;
                    case ACHIEVEMENTS_API:
                        urlPathArray.shift()
                        achievementsManager(request, response, urlPathArray);
                        break;
                    case FRIENDS_API:
                        urlPathArray.shift()
                        friendsApiPost(request, response, urlPathArray);
                        break;
                    default:
                        urlNotFound(request, response)
                }
            });
            break;
        case "GET":
            switch (urlPathArray[0] + "/") {
                case FRIENDS_API:
                    urlPathArray.shift()
                    friendsApiGet(request, response, urlPathArray);
                    break;
                case USERS_API:
                    urlPathArray.shift()
                    usersApiGet(request, response, urlPathArray);
                    break;
                case NOTIFICATIONS_API:
                    urlPathArray.shift()
                    notificationsApiGet(request, response, urlPathArray);
                    break;
                case CHATS_API:
                    urlPathArray.shift()
                    messagesApiGet(request, response, urlPathArray);
                    break;
                case STATS_API:
                    urlPathArray.shift()
                    userStatsGet(request, response, urlPathArray);
                    break;
                default:
                    urlNotFound(request, response)
            }
            break;
        case "DELETE":
            switch (urlPathArray[0] + "/") {
                case FRIENDS_API:
                    urlPathArray.shift()
                    friendsApiDelete(request, response, urlPathArray);
                    break;
                case NOTIFICATIONS_API:
                    urlPathArray.shift()
                    notificationsApiDelete(request, response, urlPathArray);
                    break;
                default:
                    urlNotFound(request, response)
            }
            break;
        default:
            urlNotFound(request, response);
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

