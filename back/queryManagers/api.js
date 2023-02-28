// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.

import {sendResponse} from "./util.js";
import {userSignUp, userLogIn} from "./user/apiUser.js";

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
            if (urlPath[2] === "signup") {
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

