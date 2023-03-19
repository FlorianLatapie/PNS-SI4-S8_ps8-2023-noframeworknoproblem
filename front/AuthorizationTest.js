let url = "https://yourUrl";
let token = "toto";
let bearer = 'Bearer ' + token;
fetch(url, {
    method: 'GET',
    withCredentials: true,
    credentials: 'include',
    headers: {
        'Authorization': bearer,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
}).then(response => {
    console.log("success");
})
    .catch(error => console.log("ehec"));
