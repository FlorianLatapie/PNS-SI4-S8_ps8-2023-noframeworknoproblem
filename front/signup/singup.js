let token = "";
window.addEventListener('load', function () {

    /* Exercise 3 */
    document.getElementById("signup-button").addEventListener("click", function() {
        const values = {
            username: document.getElementById("signup-username").value,
            email: document.getElementById("signup-email").value,
            password: document.getElementById("signup-password").value,
        }

        fetch("http://localhost:8000/api/signup", {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(values)
        }).then( (response) => {
            console.log(response);
        });
    });
    /* End Exercise 3 */

    /* Exercise 4 */
    document.getElementById("loginButton").addEventListener("click", function() {
        const values = {
            username: document.getElementById("loginUsername").value,
            password: document.getElementById("loginPassword").value,
        }

        fetch("http://localhost:8765/login", {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(values)
        }).then(async (response) => {
            // if the login worked, we should save the token.
            token = await response.text();
        });
    });
});
