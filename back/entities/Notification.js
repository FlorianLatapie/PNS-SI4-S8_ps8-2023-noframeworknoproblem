class Notification {

    /* Message is a string
     * Action is an action object representing an api call
     */
    constructor(message, action) {
        this.message = message
        this.action = action
    }
}

export default Notification
