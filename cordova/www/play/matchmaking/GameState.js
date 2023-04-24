class GameState {
    #colorPlayer;
    #colorOtherPlayer;
    #toPlay;

    constructor(colorPlayer, colorOtherPlayer, grid, toPlay) {
        this.#colorPlayer = colorPlayer;
        this.#colorOtherPlayer = colorOtherPlayer;
        this.#toPlay = toPlay;
    }

    getColorPlayer() {
        return this.#colorPlayer;
    }

    getColorOtherPlayer() {
        return this.#colorOtherPlayer;
    }

    getToPlay() {
        return this.#toPlay;
    }

    changeToPlay() {
        this.#toPlay = !this.#toPlay;
    }
}

export default GameState;
