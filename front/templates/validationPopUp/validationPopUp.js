function validationPopUp(functionToExecute, text) {
    const validationPopUp = document.createElement("div");
    validationPopUp.classList.add("validation-popup");

    const popUpContainer = document.createElement("div")
    popUpContainer.classList.add("popup-container", "flex-column");

    const content = document.createElement("p")
    content.innerText = text;

    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("buttons-popup", "flex-row");

    const yesButton = document.createElement("button");
    yesButton.innerText = "Oui";
    yesButton.addEventListener("click", () => {
        functionToExecute();
        validationPopUp.remove();
    });

    const noButton = document.createElement("button");
    noButton.innerText = "Non";
    noButton.addEventListener("click", () => {
        validationPopUp.remove();
    });

    // ------------------ Add elements to the DOM ------------------
    const buttonsFragment = document.createDocumentFragment();

    buttonsFragment.appendChild(yesButton);
    buttonsFragment.appendChild(noButton);

    buttonsContainer.appendChild(buttonsFragment);

    const popUpFragment = document.createDocumentFragment();
    popUpFragment.appendChild(content);
    popUpFragment.appendChild(buttonsContainer);

    popUpContainer.appendChild(popUpFragment);
    validationPopUp.appendChild(popUpContainer);

    document.body.appendChild(validationPopUp);
}

export { validationPopUp };
