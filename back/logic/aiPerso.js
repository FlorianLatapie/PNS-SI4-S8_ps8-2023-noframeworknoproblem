let width = 7;
let height = 6;

function copyArray(grid) {
    let newGrid = new Array(height);
    for (let i = 0; i < height; i++) {
        newGrid[i] = Array.from(grid[i]);
    }
    return newGrid;
}

class AI {

    setup(AIplays) {
        // need to initialize the grid
        // need to transform it later to improve performance
        this.player = AIplays;
        this.grid = new Array(height);

        for (let i = 0; i < height; i++) {
            this.grid[i] = new Array(width);
            for (let j = 0; j < width; j++) {
                this.grid[i][j] = 0;
            }
        }
        return true;
    }

    nextMove(lastMove) {
        // update the grid with the last move
        this.grid[lastMove[1]][lastMove[0]] = this.player === 1 ? 2 : 1;

        // make play the AI
        let bestMove = this.minmax(this.grid, 6, true, -Infinity, Infinity)["Move"];

        // update the grid with the AI move
        this.grid[bestMove[1]][bestMove[0]] = this.player;

        // return the best move find
        return bestMove;
    }

    minmax(grid, depth, isMaximizingPlayer, alpha, beta) {
        let res = {};
        if (depth === 0) {
            res["Score"] = this.evaluate(grid);
            res["Move"] = null;
            return res;
        }

        let endGame = GridChecker.isGameOver(grid);
        if (endGame === GridChecker.win) {
            // TODO : change the value of the evaluation function
            if (isMaximizingPlayer) {
                // the player won
                res["Score"] = -1;
                res["Move"] = null;
                return res;
            } else {
                // the AI won
                res["Score"] = 1;
                res["Move"] = null;
                return res;
            }
        } else if (endGame === GridChecker.draw) {
            // nobody won
            res["Score"] = 0;
            res["Move"] = null;
            return res;
        }

        if (isMaximizingPlayer) {
            let maxEval = -Infinity;
            // for each possible move
            for (let move of GridMoves.possibleMoves(grid)) {
                let newGrid = copyArray(grid);
                newGrid[move[1]][move[0]] = this.player;
                let evalMove = this.minmax(newGrid, depth - 1, false, alpha, beta);
                maxEval = Math.max(maxEval, evalMove);
                alpha = Math.max(alpha, evalMove);
                if (beta <= alpha) {
                    break;
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            // for each possible move
            for (let move of GridMoves.possibleMoves(grid)) {
                let newGrid = copyArray(grid);
                newGrid[move[1]][move[0]] = this.player;
                let evalMove = this.minmax(newGrid, depth - 1, true, alpha, beta);
                minEval = Math.min(minEval, evalMove);
                beta = Math.min(beta, evalMove);
                if (beta <= alpha) {
                    break;
                }
            }
            return minEval;
        }
    }

    // This function returned the possible moves for the AI to play
    // the result is an array of elements being [column, row]

    // TODO : write the evaluation function
    // return an object with the move and the evaluation
    // obj.value = evaluation
    // obj.move = move [column, row]
    evaluate(grid) {
        return {value: 0, move: [0, 0]};
    }
}

class GridMoves {
    static possibleMoves(grid) {
        let moves = [];
        let middle = 3;
        if (GridChecker.isColumnEmpty(grid, middle)) {
            for (let row = height; row >= 0; row--) {
                if (grid[row][middle] !== 0) {
                    moves.push([middle, row]);
                    break;
                }
            }
        }
        for (let i = 1; i < 4; i++) {
            if (GridChecker.isColumnEmpty(grid, middle + i)) {
                for (let row = height; row >= 0; row--) {
                    if (grid[row][middle + i] !== 0) {
                        moves.push([middle + i, row]);
                        break;
                    }
                }
            }

            if (GridChecker.isColumnEmpty(grid, middle - i)) {
                for (let row = height; row >= 0; row--) {
                    if (grid[row][middle - i] !== 0) {
                        moves.push([middle - i, row]);
                        break;
                    }
                }
            }
        }
        return moves;
    }
}

class GridChecker {

    static win = "win";
    static draw = "draw";
    static notOver = "notOver"

    static checkHorizontal(grid, row, column, color) {
        let count = 0;
        for (let i = -3; i < 4; i++) {
            if (0 <= column + i && column + i < width) {
                if (grid[row][column + i] === color) {
                    count++;
                    if (count === 4) {
                        return true;
                    }
                } else {
                    count = 0;
                }
            }
        }
    }

    static checkVertical(grid, row, column, color) {
        let count = 0;
        for (let i = -3; i < 4; i++) {
            if (0 <= row + i && row + i < height) {
                if (grid[row + i][column] === color) {
                    count++;
                    if (count === 4) {
                        return true;
                    }
                } else {
                    count = 0;
                }
            }
        }
    }

    static checkDiagonalBottomLeftTopRight(grid, row, column, color) {
        let count = 0;
        for (let i = -3; i < 4; i++) {
            if (0 <= row - i && row - i < height && 0 <= column + i && column + i < width) {
                if (grid[row - i][column + i] === color) {
                    count++;
                    if (count === 4) {
                        return true;
                    }
                } else {
                    count = 0;
                }
            }
        }
    }

    static checkDiagonalTopRightBottomLeft(grid, row, column, color) {
        let count = 0;
        for (let i = -3; i < 4; i++) {
            if (0 <= row + i && row + i < height && 0 <= column + i && column + i < width) {
                if (grid[row + i][column + i] === color) {
                    count++;
                    if (count === 4) {
                        return true;
                    }
                } else {
                    count = 0;
                }
            }
        }
    }

    static checkDraw(grid) {
        for (let column = 0; width; column++) {
            if (GridChecker.isColumnEmpty(grid, column)) {
                return false;
            }
        }
        return true;
    }

    static isGameOver(grid, row, column, color) {
        if (GridChecker.checkDraw(grid)) {
            return GridChecker.draw;
        }
        if (GridChecker.checkHorizontal(grid, row, column, color) ||
            GridChecker.checkVertical(grid, row, column, color) ||
            GridChecker.checkDiagonalBottomLeftTopRight(grid, row, column, color) ||
            GridChecker.checkDiagonalTopRightBottomLeft(grid, row, column, color)) {
            return GridChecker.win;
        }
        return GridChecker.notOver;
    }

    static isColumnEmpty(grid, column) {
        return grid[0][column] === 0;
    }
}


