export default function computeMove(gameEngine) {
    console.log("IA in loop")
    while(true) {
        // Get a random column (integer between 0 and 6)
        let i = Math.floor(Math.random() * gameEngine.grid.width);
        console.log("column " + i)
        for (let j=0 ; j < gameEngine.grid.height ; j++) {
            console.log("column " + i + " row " + j)
            if (gameEngine.checkValidityMove(i, j) === true) {
                console.log("Before return")
                return [i, j];
            }
        }
    }
}
