
document.getElementById("form-position").addEventListener("submit", function (event) {
    event.preventDefault();
    let humanOrder = document.querySelector("input[name=\"position\"]:checked").value;

    let AITurn = 1;
    if (humanOrder === "first") {
        AITurn = 2;
    } else if (humanOrder === "second") {
        AITurn = 1;
    }
    window.location.replace(window.location.protocol + "//" + window.location.host + "/play/aiPlay/aiPlay.html" + "?" + "AIplays=" + AITurn);
});
