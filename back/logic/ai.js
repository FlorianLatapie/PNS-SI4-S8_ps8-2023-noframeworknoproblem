export default function computeMove(gameEngine) {
    while(true) {
        // Get a random column (integer between 0 and 6)
        let column = Math.floor(Math.random() * gameEngine.grid.width);
        for (let row=0 ; row < gameEngine.grid.height ; row++) {
            if (gameEngine.checkValidityMove(column, row) === true) {
                return [column, row];
            }
        }
    }
}
