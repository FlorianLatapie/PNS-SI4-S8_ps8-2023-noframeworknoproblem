let media_is_defined = false;

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    console.log("Device is ready")
    media_is_defined = true;
    // playSoundMessageReceived()

}


function playSoundDevice(srcSound) {
    console.log("BeforeplaySoundDevice", srcSound);

    if (!media_is_defined) {
        console.log("Media is not defined");
        return;
    }

    let mediaSuccess = function () {
        console.log("Sound played successfully");
    }

    let mediaError = function (err) {
        console.log("Error playing sound: " + JSON.stringify(err));
    }

    let mediaStatus = function (status) {
        if (status === Media.MEDIA_STOPPED) {
            console.log("Sound stopped");
        } else if (status === Media.MEDIA_STARTING) {
            console.log("Sound starting");
        } else if (status === Media.MEDIA_RUNNING) {
            console.log("Sound running");
        } else if (status === Media.MEDIA_PAUSED) {
            console.log("Sound paused");
        }
    }

    console.log("Before playing the sound")

    let media = new Media(srcSound, mediaSuccess, mediaError, mediaStatus)
    media.play();
    media.setVolume("1.0");
    media.stop();
    media.release();
    console.log("AfterplaySoundDevice", srcSound);
}

export {playSoundDevice}
