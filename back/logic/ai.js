export default function computeMove(gameEngine) {
    let validMoves = [0, 1, 2, 3, 4, 5, 6];
    validMoves = validMoves.filter(column => !gameEngine.grid.isColumnFull(column));

    let randomIndex = Math.floor(Math.random() * validMoves.length);
    let column = validMoves[randomIndex];

    let row = gameEngine.grid.getRowOfLastDisk(column);
    console.log("IA plays : column " + column + " row " + row)
    return [column, row]
}
