import {playSoundDevice} from "../../util/cordova/playSoundDevice.js";

// TODO : Potentially a problem on the path
const SOUND_MESSAGE_RECEIVED = `file:///sounds/messageReceived.mp3`;

function playSoundMessageReceived() {
    playSoundDevice(SOUND_MESSAGE_RECEIVED);
}

export {playSoundMessageReceived};
