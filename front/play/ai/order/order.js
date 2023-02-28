import {PARAMETER_NAME_IA_PLAYS} from "../constant.js";

let form = document.getElementById("form-position")
form.addEventListener("submit", function (event) {
    event.preventDefault();
    let AIplays = document.querySelector("input[name=\"AIplays\"]:checked").value;
    form.method = "get";
    form.action = window.location.protocol + "//" + window.location.host +
        "/play/ai/" + "?" + PARAMETER_NAME_IA_PLAYS + "=" + AIplays;
    form.submit();
});
