console.log("Navigator Agent " + navigator.userAgent)

document.addEventListener("onload", () => {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Load cordova.js for mobile devices
        let script = document.createElement('script');
        script.src = '/cordova.js';
        document.body.appendChild(script);
    }
});

