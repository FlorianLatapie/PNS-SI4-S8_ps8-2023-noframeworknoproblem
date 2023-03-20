import {API_URL, BASE_URL, FRIENDS_URL, HOME_URL} from "../path.js";

const friendsListContainer = document.getElementById("users-friends");
const pendingListContainer = document.getElementById("users-pending");
const requestsListContainer = document.getElementById("users-requests");
window.addEventListener('load', function () {
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
});

function createUserRepresentation(userObj) {
    const container = document.createElement('div');
    const img = document.createElement('img');
    const usernameContainer = document.createElement('p')

    // TODO change the link to redirect to the user page
    container.addEventListener("click", () => {
        window.location.replace(BASE_URL + HOME_URL)
    })

    container.classList.add("flex-row", "userProfil");
    img.classList.add("profil_image");

    img.src = "../images/user-solid.svg"
    img.alt = "Profil image"

    usernameContainer.innerHTML = userObj.username;

    const fragment = document.createDocumentFragment();
    fragment.appendChild(img)
    fragment.appendChild(usernameContainer)

    container.appendChild(fragment)
    return container;
}

function addFriendToContainer(friend) {
    const friendContainer = document.createElement('div')
    const friendDiv = createUserRepresentation(friend);
    const removeButton = document.createElement('button');

    friendContainer.classList.add("flex-row");

    removeButton.innerHTML = "Remove";

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

    removeButton.innerHTML = "Remove";
    acceptButton.innerHTML = "Accept";

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
    removeButton.innerHTML = "Remove";

    const fragment = document.createDocumentFragment();
    fragment.appendChild(requestDiv);
    fragment.appendChild(removeButton);

    requestContainer.appendChild(fragment);
    requestsListContainer.appendChild(requestContainer);
}


