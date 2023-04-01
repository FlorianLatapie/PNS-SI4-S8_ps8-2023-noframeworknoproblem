import {BASE_URL} from "../../../util/frontPath.js";
import {HOME_URL} from "../../../util/path.js";

function endGamePopUp(text, imgSrc) {
    const validationPopUp = document.createElement("div");
    validationPopUp.classList.add("popup");

    const popUpContainer = document.createElement("div")
    popUpContainer.classList.add("popup-container", "flex-column");

    const content = document.createElement("p")
    content.innerText = text

    const imgContainer = document.createElement("div");
    imgContainer.classList.add("img-container");

    const img = document.createElement("img");
    img.src = imgSrc;

    const closeIcon = document.createElement("img");
    closeIcon.src = BASE_URL + "/images/cross.png";

    closeIcon.addEventListener("click", () => {
        validationPopUp.remove();
    });

    const homeButton = document.createElement("button");
    homeButton.innerText = "Retour à l'accueil";
    homeButton.addEventListener("click", () => {
        window.location.replace(BASE_URL + HOME_URL);
    });

    // ------------------ Add elements to the DOM ------------------

    imgContainer.appendChild(closeIcon);


    const popUpFragment = document.createDocumentFragment();
    popUpFragment.appendChild(imgContainer);
    popUpFragment.appendChild(content);
    popUpFragment.appendChild(img);
    popUpFragment.appendChild(homeButton);

    popUpContainer.appendChild(popUpFragment);
    validationPopUp.appendChild(popUpContainer);

    document.body.appendChild(validationPopUp);
}

export { endGamePopUp };
