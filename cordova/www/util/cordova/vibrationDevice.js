function vibrateDevice(duration) {
    // Check if the navigator object and the vibrate method are available
    if ('vibrate' in navigator) {
        navigator.vibrate(duration);
    } else {
        console.log('Vibration not supported');
    }
}

export {vibrateDevice}
