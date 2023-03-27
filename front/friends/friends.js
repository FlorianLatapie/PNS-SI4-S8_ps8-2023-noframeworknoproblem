import {API_URL, FRIENDS_URL, PLAY_CHALLENGE_URL} from "../util/path.js";
import {createUserPreviewDiv} from "../templates/userInList/UserRepresentationInList.js";
import {BASE_URL} from "../util/frontPath.js";
import {OPPONENT_ID, IS_NEW_CHALLENGE} from "../play/challenge/constantsChallenge.js";

const friendsListContainer = document.getElementById("users-friends");
const pendingListContainer = document.getElementById("users-pending");
const requestsListContainer = document.getElementById("users-requests");
window.addEventListener('load', getAllData);

function getAllData() {
    fetch(BASE_URL + API_URL + FRIENDS_URL + "getAll", {
        method: "get", headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        console.log("Response status " + response.status);
        if (!response.ok) {
            console.log("Error while retrieving users", response.status)
            // There is an error
        }
        return response.json()

    }).then(data => {
        data["friends"].forEach(user => addFriendToContainer(user));
        data["pending"].forEach(user => addPendingToContainer(user));
        data["requests"].forEach(user => addRequestToContainer(user));
    })
}

function addFriendToContainer(friend) {
    const friendContainer = document.createElement('div')
    const friendDiv = createUserPreviewDiv(friend);
    const removeButton = document.createElement('button');
    const challengeButton = document.createElement('button');

    friendContainer.classList.add("flex-row");
    let userId = friendDiv.id;

    removeButton.innerHTML = "Supprimer";
    removeButton.addEventListener("click", () => deleteFriendApi("removeFriend", userId, friendContainer));

    challengeButton.innerHTML = "Défier";
    challengeButton.addEventListener("click", () => {
        window.location.replace(BASE_URL + PLAY_CHALLENGE_URL + `?${OPPONENT_ID}=${userId}&${IS_NEW_CHALLENGE}=true`)
    });

    const fragment = document.createDocumentFragment();
    fragment.appendChild(friendDiv);
    fragment.appendChild(removeButton);
    fragment.appendChild(challengeButton);

    friendContainer.appendChild(fragment);
    friendsListContainer.appendChild(friendContainer);
}

function addPendingToContainer(pending) {
    const pendingContainer = document.createElement('div')
    const pendingDiv = createUserPreviewDiv(pending);
    const removeButton = document.createElement('button');
    const acceptButton = document.createElement('button');

    pendingContainer.classList.add("flex-row");
    let userId = pendingDiv.id;

    removeButton.innerHTML = "Décliner";
    removeButton.addEventListener("click", () => deleteFriendApi("removePending", userId, pendingContainer));
    acceptButton.innerHTML = "Accepter";
    acceptButton.addEventListener("click", () => addFriendApi("accept", userId, pendingContainer));

    const fragment = document.createDocumentFragment();
    fragment.appendChild(pendingDiv);
    fragment.appendChild(removeButton);
    fragment.appendChild(acceptButton);

    pendingContainer.appendChild(fragment);
    pendingListContainer.appendChild(pendingContainer);
}

function addRequestToContainer(request) {
    const requestContainer = document.createElement('div')
    const requestDiv = createUserPreviewDiv(request);
    const removeButton = document.createElement('button');

    let userId = requestDiv.id;

    requestContainer.classList.add("flex-row");
    removeButton.innerHTML = "Supprimer";
    removeButton.addEventListener("click", () => deleteFriendApi("removeRequest", userId, requestContainer));

    const fragment = document.createDocumentFragment();
    fragment.appendChild(requestDiv);
    fragment.appendChild(removeButton);

    requestContainer.appendChild(fragment);
    requestsListContainer.appendChild(requestContainer);
}

function callFriendAPI(method, action, id) {
    return fetch(BASE_URL + API_URL + FRIENDS_URL + action + "/" + id, {
        method: method, headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
}

function addFriendApi(action, id, container) {
    callFriendAPI("post", action, id).then((response) => {
        if (!response.ok) {
            throw new Error("Error while calling API (button) " + response.status)
        }
        addFriendToContainer(
            {userId: container.getAttribute("id"),
                username: container.getElementsByClassName("username")[0].innerHTML})
        container.remove();
    }).catch(error => {
        console.log(error);
    });
}

function deleteFriendApi(action, id, container) {
    callFriendAPI("delete", action, id).then((response) => {
        if (!response.ok) {
            throw new Error("Error while calling API (button) " + response.status)
        }
        container.remove();
    }).catch(error => {
        console.log(error);
    });
}


