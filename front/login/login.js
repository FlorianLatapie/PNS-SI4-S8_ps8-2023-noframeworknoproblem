function parseJwt(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
}

function redirectHomePage() {
    window.location.replace(window.location.protocol + "//" + window.location.host + "/home/home.html");
}


if (localStorage.getItem("token") !== null) {
    redirectHomePage();
}

document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const values = {
        username: document.getElementById("login-username").value,
        password: document.getElementById("login-password").value,
    }

    fetch(window.location.protocol + "//" + window.location.host + "/api/login", {
        method: "post", headers: {
            'Accept': 'application/json', 'Content-Type': 'application/json'
        }, body: JSON.stringify(values)
    }).then(async (response) => {
        // if the login worked, we should save the token.
        let jwtToken = await response.text();
        localStorage.setItem("token", jwtToken);

        let parsedJwt = parseJwt(jwtToken);
        console.log(parsedJwt);

        let username = parsedJwt.username;
        localStorage.setItem("username", username);

        let userId = parsedJwt.userId;
        localStorage.setItem("userId", userId);
        console.log("userId: " + userId);
        redirectHomePage();
    });
});
