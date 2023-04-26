function beepDevice(duration) {
    // Check if the navigator object and the vibrate method are available
    if ('notification' in navigator) {
        navigator.notification.beep(duration);
    } else {
        console.log('Notification not supported');
    }
}

export {beepDevice}
