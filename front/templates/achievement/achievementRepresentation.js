function achievementRepresentation(nameAchievement, found, advancement, goal, srcImg) {
    const imgContainer = document.createElement("div");
    const img = document.createElement("img");
    const info = document.createElement("p");

    imgContainer.classList.add("flex-column-center");
    img.src = srcImg;
    img.classList.add("achievement-img");
    info.style.visibility = "hidden";

    if (!found) {
        img.classList.add("achievement-notfound");
        info.innerText = advancementRepresentation(nameAchievement, advancement, goal);
    } else {
        img.classList.add("achievement-found");
        info.innerText = nameAchievement;
    }

    img.addEventListener("mouseenter", () => {
        info.style.visibility = "visible";
    });
    img.addEventListener("mouseleave", () => {
        info.style.visibility = "hidden";
    });

    imgContainer.appendChild(img);
    imgContainer.appendChild(info);
    return imgContainer;

    function advancementRepresentation(nameAchievement, advancement, goal) {
        return `${nameAchievement} : ${advancement} / ${goal} (${advancement / goal * 100}%)`;
    }
}

export {achievementRepresentation}
