// The http module contains methods to handle http queries.
import * as http from 'http';
// Let's import our logic.
//const fileQuery = require('./queryManagers/front.js')
import * as fileQuery from './queryManagers/front.js'
import * as apiQuery from './queryManagers/api.js'
//const apiQuery = import('./queryManagers/api.js')

/* The http module contains a createServer function, which takes one argument, which is the function that
** will be called whenever a new request arrives to the server.
 */
let httpServer = http.createServer(function (request, response) {
    // First, let's check the URL to see if it's a REST request or a file request.
    // We will remove all cases of "../" in the url for security purposes.
    let filePath = request.url.split("/").filter(function(elem) {
        return elem !== "..";
    });

    try {
        // If the URL starts by /api, then it's a REST request (you can change that if you want).
        if (filePath[1] === "api") {
            apiQuery.manage(request, response);
            // If it doesn't start by /api, then it's a request for a file.
        } else {
            fileQuery.manage(request, response);
            // error while processing /: TypeError: fileQuery.manage is not a function

        }
    } catch(error) {
        console.log(`error while processing ${request.url}: ${error}`)
        response.statusCode = 400;
        response.end(`Something in your request (${request.url}) is strange...`);
    }
// For the server to be listening to request, it needs a port, which is set thanks to the listen function.
}).listen(8000);

// SetUp of the webSocket server.

//const { Server } = require("socket.io");
// convert this require to an import
import { Server } from "socket.io";
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
