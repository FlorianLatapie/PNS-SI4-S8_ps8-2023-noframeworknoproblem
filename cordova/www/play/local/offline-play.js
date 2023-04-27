document.addEventListener("offline", onOffline, false);
document.addEventListener("online", onOnline, false);

function onOffline() {
    document.getElementsByTagName("burger-menu-open-close")[0].style.visibility = "hidden";
    document.getElementsByTagName("burger-menu")[0].style.visibility = "hidden";
    document.getElementsByClassName("top-page")[0].style.width = "100%"
}

function onOnline() {
    document.getElementsByTagName("burger-menu-open-close")[0].style.visibility = "visible";
    document.getElementsByTagName("burger-menu")[0].style.visibility = "visible";
    document.getElementsByClassName("top-page")[0].style.width = "calc(100% - 79px)";
}
