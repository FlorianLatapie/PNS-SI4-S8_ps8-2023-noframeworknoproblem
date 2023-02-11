let jwtToken;
document.getElementById("login-button").addEventListener("click", function() {
    const values = {
        usernameOrEmail: document.getElementById("login-username").value,
        password: document.getElementById("login-password").value,
    }

    fetch("http://localhost:8000/api/login", {
        method: "post",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
    }).then(async (response) => {
        // if the login worked, we should save the token.
        jwtToken = await response.text();
        localStorage.setItem("token", jwtToken);
    });
});
