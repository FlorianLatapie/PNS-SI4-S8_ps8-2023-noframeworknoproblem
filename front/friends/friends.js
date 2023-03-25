import {API_URL, BASE_URL, FRIENDS_URL} from "../path.js";
import {createUserRepresentation} from "../templates/userInList/UserRepresentationInList.js";

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
    const friendDiv = createUserRepresentation(friend);
    const removeButton = document.createElement('button');

    friendContainer.classList.add("flex-row");

    removeButton.innerHTML = "Supprimer";
    removeButton.addEventListener("click", () => callFriendAPI("delete", "removeFriend", friendDiv.getElementsByTagName("p")[0].id));

    const fragment = document.createDocumentFragment();
    fragment.appendChild(friendDiv);
    fragment.appendChild(removeButton);

    friendContainer.appendChild(fragment);
    friendsListContainer.appendChild(friendContainer);
}

function addPendingToContainer(pending) {
    const pendingContainer = document.createElement('div')
    const pendingDiv = createUserRepresentation(pending);
    const removeButton = document.createElement('button');
    const acceptButton = document.createElement('button');

    pendingContainer.classList.add("flex-row");

    removeButton.innerHTML = "Décliner";
    removeButton.addEventListener("click", () => callFriendAPI("delete", "removePending", pendingDiv.getElementsByTagName("p")[0].id));
    acceptButton.innerHTML = "Accepter";
    acceptButton.addEventListener("click", () => callFriendAPI("post", "accept", pendingDiv.getElementsByTagName("p")[0].id));

    const fragment = document.createDocumentFragment();
    fragment.appendChild(pendingDiv);
    fragment.appendChild(removeButton);
    fragment.appendChild(acceptButton);

    pendingContainer.appendChild(fragment);
    pendingListContainer.appendChild(pendingContainer);
}

function addRequestToContainer(request) {
    const requestContainer = document.createElement('div')
    const requestDiv = createUserRepresentation(request);
    const removeButton = document.createElement('button');

    requestContainer.classList.add("flex-row");
    removeButton.innerHTML = "Supprimer";
    removeButton.addEventListener("click", () => callFriendAPI("delete", "removeRequest", requestDiv.getElementsByTagName("p")[0].id));

    const fragment = document.createDocumentFragment();
    fragment.appendChild(requestDiv);
    fragment.appendChild(removeButton);

    requestContainer.appendChild(fragment);
    requestsListContainer.appendChild(requestContainer);
}

function callFriendAPI(method, action, id) {
    fetch(BASE_URL + API_URL + FRIENDS_URL + action + "/" + id, {
        method: method, headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error while calling API (button) " + response.status)
        }
        reloadAllData();
    }).catch(error => {
        console.log(error);
    })
}

function reloadAllData() {
    friendsListContainer.innerHTML = "";
    pendingListContainer.innerHTML = "";
    requestsListContainer.innerHTML = "";
    getAllData();
}


