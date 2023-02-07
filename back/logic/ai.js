export default function computeMove(gameEngine) {
    while(true) {
        // Get a random column (integer between 0 and 6)
        let i = Math.floor(Math.random() * gameEngine.grid.width);
        for (let j=0 ; j < gameEngine.grid.height ; j++) {
            if (gameEngine.checkValidityMove(i, j) === true) {
                return [i, j];
            }
        }
    }
}
