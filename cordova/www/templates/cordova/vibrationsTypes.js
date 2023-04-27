import {vibrateDevice} from "../../util/cordova/vibrationDevice.js";

function winningVibration() {
    vibrateDevice([800, 600, 800])
}

function losingVibration() {
    vibrateDevice([1500, 1000, 1500])
}

function drawVibration() {
    vibrateDevice([1000, 800, 1000])
}

export {winningVibration, losingVibration, drawVibration}
