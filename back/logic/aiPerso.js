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
            // need to convert the coordinates to the ai coordinates
            this.grid[height - 1 - lastMove[1]][lastMove[0]] = this.otherPlayer;

        }

        // make play the AI
        let bestMove = this.minMaxInit(this.grid, 2);

        // update the grid with the AI move
        this.grid[bestMove[1]][bestMove[0]] = this.player;

        // need to convert the coordinates to the api coordinates
        bestMove = [bestMove[0], height - 1 - bestMove[1]];
        console.log("move play by AI : ", bestMove);
        return bestMove;
    }

    minMaxInit(grid, depth) {
        let alpha = Number.NEGATIVE_INFINITY;
        let beta = Number.POSITIVE_INFINITY;

        let maxEval = Number.NEGATIVE_INFINITY;
        let bestMove = null;
        // for each possible move
        for (let move of GridMoves.possibleMoves(grid)) {
            let newGrid = copyArray(grid);
            newGrid[move[1]][move[0]] = this.player;
            let evalMove = this.minMax(newGrid, depth - 1, false, alpha, beta);
            if (evalMove > maxEval) {
                maxEval = evalMove;
                bestMove = move;
            }

            alpha = Math.max(alpha, maxEval);
            if (beta <= alpha) {
                break;
            }
        }
        return bestMove;
    }

    minMax(grid, depth, isMaximizingPlayer, alpha, beta) {
        if (depth === 0) {
            return this.evaluate(grid);
        }

        let endGame = GridChecker.isGameOver(grid);
        if (endGame === GridChecker.win) {
            // TODO : change the value of the evaluation function
            if (isMaximizingPlayer) {
                // the player won
                return -100;
            } else {
                // the AI won
                return 100;
            }
        } else if (endGame === GridChecker.draw) {
            // nobody won
            return 0;
        }

        if (isMaximizingPlayer) {
            let maxEval = Number.NEGATIVE_INFINITY;
            // for each possible move
            for (let move of GridMoves.possibleMoves(grid)) {
                console.log(move);
                let newGrid = copyArray(grid);
                newGrid[move[1]][move[0]] = this.player;
                let evalMove = this.minMax(newGrid, depth - 1, false, alpha, beta);
                maxEval = Math.max(maxEval, evalMove);
                alpha = Math.max(alpha, maxEval);
                if (beta <= alpha) {
                    break;
                }
            }
            return maxEval;
        } else {
            let minEval = Number.POSITIVE_INFINITY;
            // for each possible move
            for (let move of GridMoves.possibleMoves(grid)) {
                let newGrid = copyArray(grid);
                newGrid[move[1]][move[0]] = this.otherPlayer;
                let evalMove = this.minMax(newGrid, depth - 1, true, alpha, beta);
                minEval = Math.min(minEval, evalMove);
                beta = Math.min(beta, minEval);
                if (beta <= alpha) {
                    break;
                }
            }
            return minEval;
        }
    }

    countAligned(aligned) {
        switch (aligned) {
            case 0:
                return 0;
            case 1:
                return 0;
            case 2:
                return 10;
            case 3:
                return 100;
            case 4:
                return 1000;
            default:
                throw new Error("Invalid argument:", aligned);
        }
    }

    // This function returned the possible moves for the AI to play
    // the result is an array of elements being [column, row]

    // return an integer
    evaluate(grid) {
        // return a random number between -10 and 10
        let score = 0;
        // check vertical
        for (let i = 0; i < grid.length - 3; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                let count1 = 0;
                let count2 = 0;
                for (let k = 0; k < 4; k++) {
                    if (grid[i + k][j] === 1) {
                        count1++;
                    } else if (grid[i + k][j] === 2) {
                        count2++;
                    }
                }
                score += this.countAligned(count1);
                score -= this.countAligned(count2);
            }
        }

        // check horizontal
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length - 3; j++) {
                let count1 = 0;
                let count2 = 0;
                for (let k = 0; k < 4; k++) {
                    if (grid[i][j + k] === 1) {
                        count1++;
                    } else if (grid[i][j + k] === 2) {
                        count2++;
                    }
                }
                score += this.countAligned(count1);
                score -= this.countAligned(count2);
            }
        }

        // check diagonal
        for (let i = 0; i < grid.length - 3; i++) {
            for (let j = 0; j < grid[i].length - 3; j++) {
                let count1 = 0;
                let count2 = 0;
                for (let k = 0; k < 4; k++) {
                    if (grid[i + k][j + k] === 1) {
                        count1++;
                    } else if (grid[i + k][j + k] === 2) {
                        count2++;
                    }
                }
                score += this.countAligned(count1);
                score -= this.countAligned(count2);
            }
        }

        // check anti-diagonal
        for (let i = 0; i < grid.length - 3; i++) {
            for (let j = 3; j < grid[i].length; j++) {
                let count1 = 0;
                let count2 = 0;
                for (let k = 0; k < 4; k++) {
                    if (grid[i + k][j - k] === 1) {
                        count1++;
                    } else if (grid[i + k][j - k] === 2) {
                        count2++;
                    }
                }
                score += this.countAligned(count1);
                score -= this.countAligned(count2);
            }
        }
        return score;
    }
}

class GridMoves {
    static possibleMoves(grid) {
        let moves = [];
        let middle = 3;
        if (grid[0][middle] === 0) {
            for (let row = height - 1; row >= 0; row--) {
                if (grid[row][middle] === 0) {
                    moves.push([middle, row]);
                    break;
                }
            }
        }
        for (let i = 1; i < 4; i++) {
            let column1 = middle + i;
            if (grid[0][column1] === 0) {
                for (let row = height - 1; row >= 0; row--) {
                    if (grid[row][column1] === 0) {
                        moves.push([column1, row]);
                        break;
                    }
                }
            }

            let column2 = middle - i;
            if (grid[0][column2] === 0) {
                for (let row = height - 1; row >= 0; row--) {
                    if (grid[row][column2] === 0) {
                        moves.push([column2, row]);
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

// TODO : optimize the code of the GridChecker class
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
            if (grid[0][column] === 0) {
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
}

// TODO : need to put in spec later
export {AI}
