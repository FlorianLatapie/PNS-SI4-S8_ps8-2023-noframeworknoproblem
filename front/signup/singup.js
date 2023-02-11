let token = "";
window.addEventListener('load', function () {

    /* Exercise 3 */
    document.getElementById("signup-button").addEventListener("click", function () {
        const values = {
            username: document.getElementById("signup-username").value,
            email: document.getElementById("signup-email").value,
            password: document.getElementById("signup-password").value,
        }

        fetch("http://" + window.location.host + "/api/signup", {
            method: "post", headers: {
                'Accept': 'application/json', 'Content-Type': 'application/json'
            }, body: JSON.stringify(values)
        }).then((response) => {
            console.log(response);
        });
    });
});
