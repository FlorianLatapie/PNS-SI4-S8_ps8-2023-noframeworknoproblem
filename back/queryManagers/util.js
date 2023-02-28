function sendResponse(response, statusCode, message) {
    response.statusCode = statusCode;
    response.end(message);
}

export {sendResponse};
