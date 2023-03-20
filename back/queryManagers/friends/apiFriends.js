import {sendResponse} from "../util.js";
import frienddb from "../../database/frienddb.js";
import userdb from "../../database/userdb.js";

function friendsApi(urlPathArray, userIdEmitTheRequest, response, urlParams) {
    if (urlPathArray.length < 4) {
        throw new Error("URL " + urlPathArray + " not supported");
    }

    switch (urlPathArray[3]) {
        case "getFriends":
            getFriends(userIdEmitTheRequest, response);
            return;
        case "getPending":
            getPending(userIdEmitTheRequest, response);
            return;
        case "getRequests":
            getRequest(userIdEmitTheRequest, response);
            return;
        case "getAll":
            getAll(userIdEmitTheRequest, response);
            return;
    }

    if (urlPathArray.length < 5) {
        throw new Error("URL " + urlPathArray + " not supported");
    }

    switch (urlPathArray[3]) {
        case "add":
            addFriend(userIdEmitTheRequest, response, urlPathArray[4]);
            break;
        case "accept":
            acceptFriend(userIdEmitTheRequest, response, urlPathArray[4]);
            break;
        case "removeFriend":
            removeFriend(userIdEmitTheRequest, response, urlPathArray[4]);
            break;
        case "removePending":
            removePending(userIdEmitTheRequest, response, urlPathArray[4]);
            break;
        case "removeRequest":
            removeRequest(userIdEmitTheRequest, response, urlPathArray[4]);
            break;
        default:
            console.log("URL", urlPathArray, "not supported");
            sendResponse(response, 404, "URL " + urlPathArray + " not supported");
            break;
    }
}

function addFriend(userIdEmitTheRequest, response, friendId) {
    console.log("add Friend start", userIdEmitTheRequest, friendId)
    checkUserIds(userIdEmitTheRequest, friendId).then((values) => {
        let promise1 = frienddb.addRequest(userIdEmitTheRequest, friendId);
        let promise2 = frienddb.addPending(friendId, userIdEmitTheRequest);
        Promise.all([promise1, promise2]).then(() => {
            console.log("add Friend end 1")
            sendResponse(response, 200, "Friend request sent to " + friendId + " from " + userIdEmitTheRequest);
        }).catch((err) => {
            console.log("add Friend end 2")
            sendResponse(response, 404, "Friend request not processed : " + err);
        });
    }).catch((err) => {
        console.log("add Friend end 3" + err)
        sendResponse(response, 404, err);
    });
    console.log("add Friend end")
}

function acceptFriend(userIdEmitTheRequest, response, friendId) {
    checkUserIds(userIdEmitTheRequest, friendId).then((values) => {
        frienddb.addFriends(userIdEmitTheRequest, friendId).then(() => {
            sendResponse(response, 200, "Friend request accepted from " + friendId + " to " + userIdEmitTheRequest);
        }).catch((err) => {
            sendResponse(response, 404, "" + err);
        });
    }).catch((err) => {
        sendResponse(response, 404, "" + err);
    });

}

function getFriends(userIdEmitTheRequest, response) {
    console.log("getFriends", userIdEmitTheRequest);
    getFriendsInternal(userIdEmitTheRequest).then(friends => {
        sendResponse(response, 200, JSON.stringify(friends));
    }).catch(err => {
        sendResponse(response, 500, "Impossible to retrieve friends " + err)
    });
}

async function getFriendsInternal(userIdEmitTheRequest) {
    await userdb.checkUserExists(userIdEmitTheRequest)
    let friendsId = await frienddb.getFriends(userIdEmitTheRequest);
    return await userdb.getUsersByIds(friendsId);
}

function removeFriend(userIdEmitTheRequest, response, friendId) {
    frienddb.removeFriend(userIdEmitTheRequest, friendId).then(() => {
        sendResponse(response, 200, "Friend " + friendId + " removed from " + userIdEmitTheRequest);
    }).catch((err) => {
        sendResponse(response, 404, "" + err);
    });
}

function removePending(userIdEmitTheRequest, response, friendId) {
    frienddb.removePending(userIdEmitTheRequest, friendId).then(() => {
        sendResponse(response, 200, "Pending friend " + friendId + " removed from " + userIdEmitTheRequest);
    }).catch((err) => {
        sendResponse(response, 404, "" + err);
    });
}

function removeRequest(userIdEmitTheRequest, response, friendId) {
    frienddb.removeRequest(userIdEmitTheRequest, friendId).then(() => {
        sendResponse(response, 200, "Request friend " + friendId + " removed from " + userIdEmitTheRequest);
    }).catch((err) => {
        sendResponse(response, 404, "" + err);
    });
}

function getPending(userIdEmitTheRequest, response) {
    getPendingInternal(userIdEmitTheRequest).then(friends => {
        sendResponse(response, 200, JSON.stringify(friends));
    }).catch(err => {
        sendResponse(response, 500, "Impossible to retrieve friends " + err)
    });
}

async function getPendingInternal(userIdEmitTheRequest) {
    await userdb.checkUserExists(userIdEmitTheRequest)
    let friendsId = await frienddb.getPending(userIdEmitTheRequest);
    return await userdb.getUsersByIds(friendsId);
}

function getRequest(userIdEmitTheRequest, response) {
    getRequestInternal(userIdEmitTheRequest).then(friends => {
        sendResponse(response, 200, JSON.stringify(friends));
    }).catch(err => {
        sendResponse(response, 500, "Impossible to retrieve friends " + err)
    });
}

async function getRequestInternal(userIdEmitTheRequest) {
    await userdb.checkUserExists(userIdEmitTheRequest)
    let friendsId = await frienddb.getRequests(userIdEmitTheRequest);
    return await userdb.getUsersByIds(friendsId);
}

function checkUserIds(userId, friendId) {
    let checkUserId = userdb.checkUserExists(userId);
    let checkFriendId = userdb.checkUserExists(friendId);
    return Promise.all([checkUserId, checkFriendId]);
}

function getAll(userIdEmitTheRequest, response) {
    Promise.all([
        getFriendsInternal(userIdEmitTheRequest),
        getPendingInternal(userIdEmitTheRequest),
        getRequestInternal(userIdEmitTheRequest)]
    ).then((values) => {
        let friends = values[0];
        let pending = values[1];
        let requests = values[2];
        sendResponse(response, 200, JSON.stringify(
            {friends: friends, pending: pending, requests: requests}
        ));
    }).catch((err) => {
        sendResponse(response, 500, "" + err)
    });
}

export default friendsApi;
