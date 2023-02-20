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
        console.log(`AI setup : ${AIplays}`);
        this.player = AIplays;
        this.otherPlayer = AIplays === 1 ? 2 : 1;
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
        if (lastMove !== null) {
            // update the grid with the last move
            console.log("Last Move play by human", lastMove);
            this.grid[lastMove[1]][lastMove[0]] = this.otherPlayer;
        }

        // make play the AI
        let bestMove = this.minmax(this.grid, 2, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
        console.log(`Best move : `, bestMove)
        bestMove = bestMove["Move"];
        // update the grid with the AI move
        this.grid[bestMove[1]][bestMove[0]] = this.player;

        // return the best move find
        console.log(`Moved play by AI : `, bestMove);
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
                res["Score"] = -100;
                res["Move"] = null;
                return res;
            } else {
                // the AI won
                res["Score"] = 100;
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
            let maxEval = Number.NEGATIVE_INFINITY;
            let bestMove = null;
            // for each possible move
            let moves = GridMoves.possibleMoves(grid);
            console.log("moves for AI : ", moves)
            for (let move of moves) {
                console.log(move);
                let newGrid = copyArray(grid);
                newGrid[move[1]][move[0]] = this.player;
                let evalMove = this.minmax(newGrid, depth - 1, false, alpha, beta);
                if (evalMove["Score"] > maxEval) {
                    maxEval = evalMove["Score"];
                    bestMove = move;
                }
                alpha = Math.max(alpha, maxEval);
                if (beta <= alpha) {
                    break;
                }
            }
            res["Move"] = bestMove;
            res["Score"] = maxEval;
            return res;
        } else {
            let minEval = Number.POSITIVE_INFINITY;
            let bestMove = null;
            // for each possible move
            let moves = GridMoves.possibleMoves(grid);
            console.log("moves for Human Player : ", moves)
            for (let move of GridMoves.possibleMoves(grid)) {
                let newGrid = copyArray(grid);
                newGrid[move[1]][move[0]] = this.otherPlayer;
                let evalMove = this.minmax(newGrid, depth - 1, true, alpha, beta);
                if (evalMove["Score"] < minEval) {
                    minEval = evalMove["Score"];
                    bestMove = move;
                }
                beta = Math.min(beta, minEval);
                if (beta <= alpha) {
                    break;
                }
            }
            res["Move"] = bestMove;
            res["Score"] = minEval;
            return res;
        }
    }

    // This function returned the possible moves for the AI to play
    // the result is an array of elements being [column, row]

    // TODO : write the evaluation function
    // return an integer
    evaluate(grid) {
        // return a random number between -10 and 10
        return Math.floor(Math.random() * 21) - 10
    }
}

class GridMoves {
    static possibleMoves(grid) {
        let moves = [];
        let middle = 3;
        if (GridChecker.isColumnEmpty(grid, middle)) {
            for (let row = height - 1; row >= 0; row--) {
                if (grid[row][middle] === 0) {
                    moves.push([middle, row]);
                    break;
                }
            }
        }
        for (let i = 1; i < 4; i++) {
            if (GridChecker.isColumnEmpty(grid, middle + i)) {
                for (let row = height - 1; row >= 0; row--) {
                    if (grid[row][middle + i] === 0) {
                        moves.push([middle + i, row]);
                        break;
                    }
                }
            }

            if (GridChecker.isColumnEmpty(grid, middle - i)) {
                for (let row = height - 1; row >= 0; row--) {
                    if (grid[row][middle - i] === 0) {
                        moves.push([middle - i, row]);
                        break;
                    }
                }
            }
        }
        return moves;



        /*
       // more simple function
       let moves = [];
       for (let column = 0; column < width; column++) {
           if (GridChecker.isColumnEmpty(grid, column)) {
               for (let row = height - 1; row >= 0; row--) {
                   if (grid[row][column] === 0) {
                       moves.push([column, row]);
                       break;
                   }
               }
           }
           console.log("column : ", column)
       }
       return moves;

        */
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

// TODO : need to put in spec later
export {AI}
