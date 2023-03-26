import {PARAMETER_NAME_IA_PLAYS} from "../constant.js";
import {PLAY_AI_URL} from "../../../util/path.js";
import {BASE_URL} from "../../../util/frontPath.js";

let form = document.getElementById("form-position")
form.addEventListener("submit", function (event) {
    event.preventDefault();
    let AIplays = document.querySelector("input[name=\"AIplays\"]:checked").value;
    form.method = "get";
    form.action = BASE_URL + PLAY_AI_URL + "?" + PARAMETER_NAME_IA_PLAYS + "=" + AIplays;
    form.submit();
});
