// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.

// TODO : import sha256 from 'js-sha256';
// Error : Cannot find package 'js-sha256'
// import { sha256, sha224 } from 'js-sha256';
import userdb from "../database/userdb.js";
// import jwt from 'jsonwebtoken';

// TODO need to be changed
let secretCode = "secretCode";

function manageRequest(request, response) {

    response.statusCode = 200;
    addCors(response)
    let url = request.url.split("?")
    let urlPath = url[0].split("/")
    let urlParams = url[1].split("&")

    // C'est dans la correction de Vella à voir si c'est utile
    if (request.method === 'OPTIONS') {
        response.statusCode = 200;
        response.end();
    } else if (request.method === "POST") {
        let body = "";
        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function () {
            let bodyJson = JSON.parse(body);

            if (urlPath[2] === "signup") {
                // need to hash the password
                // bodyJson.password = sha256(bodyJson.password);
                // need to insert the user in the database and check error
                try {
                    userdb.addUser(bodyJson);
                    // Everything went well, we can send a response.
                    response.statusCode = 201;
                    response.end("OK");
                } catch (err) {
                    response.statusCode = 404;
                    response.end(JSON.stringify(err));
                }
            } else if (urlPath[2] === "login") {
                // need to search the user in the database and check error
                try {
                    userdb.getUser(bodyJson);
                    response.statusCode = 200;
                    // Returns a Json Web Token containing the name. We know this token is an acceptable proof of identity since only the server know the secretCode.
                    // response.end(jwt.sign({username: body.name}, secretCode, {expiresIn: "1d"}));
                    response.end("OK");
                } catch (err) {
                    response.statusCode = 404;
                    console.log(err);
                    response.end(JSON.stringify(err));
                }
            }
        });
    }
    console.log(`Received a request for ${request.url} with method ${request.method}`);

    response.statusCode = 200;
    addCors(response)
    response.end(`Thanks for calling ${request.url}`);
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

