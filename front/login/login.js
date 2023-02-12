let jwtToken;

let parseJwt = function(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
}
document.getElementById("login-button").addEventListener("click", function () {
    const values = {
        usernameOrEmail: document.getElementById("login-username").value,
        password: document.getElementById("login-password").value,
    }

    fetch("http://" + window.location.host + "/api/login", {
        method: "post", headers: {
            'Accept': 'application/json', 'Content-Type': 'application/json'
        }, body: JSON.stringify(values)
    }).then(async (response) => {
        // if the login worked, we should save the token.
        jwtToken = await response.text();
        localStorage.setItem("token", jwtToken); // TODO: do not save the token in local storage

        let parsedJwt = parseJwt(jwtToken);
        console.log(parsedJwt);

        let username = parsedJwt.username;
        localStorage.setItem("username", username);

        let userId = parsedJwt.userId;
        localStorage.setItem("userId", userId);
        console.log("userId: " + userId);
    });
});