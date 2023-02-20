let token = "";

function redirectLoginPage() {
    window.location.replace("http://" + window.location.host + "/login/");
}
window.addEventListener('load', function () {

    /* Exercise 3 */
    document.getElementById("signup-button").addEventListener("click", function () {
        const values = {
            username: document.getElementById("signup-username").value,
            mail: document.getElementById("signup-email").value,
            password: document.getElementById("signup-password").value,
        }

        fetch(window.location.protocol + "//" + window.location.host + "/api/signup", {
            method: "post", headers: {
                'Accept': 'application/json', 'Content-Type': 'application/json'
            }, body: JSON.stringify(values)
        }).then((response) => {
            console.log(response);
            if (response.status === 201) {
                redirectLoginPage();
            }
        });
    });
});
