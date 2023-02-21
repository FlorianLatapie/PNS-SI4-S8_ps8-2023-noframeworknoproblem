let width = 7;
let height = 6;

class AI {

    setup(AIplays) {
        // need to initialize the grid
        // need to transform it later to improve performance
        console.log(`AI setup : ${AIplays}`);
        this.player = AIplays;
        this.otherPlayer = AIplays === 1 ? 2 : 1;

        // initialize a grid with only 0 with a width of 7 and a height of 6
        this.grid = Array.from({ length: width }, () => new Array(height).fill(0));
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
            // make a shadow copy of the grid
            let newGrid = grid.map(row => row.slice());
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

        // TODO : need to modify this part
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
                // make a shadow copy of the grid
                let newGrid = grid.map(row => row.slice());
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
                // make a shadow copy of the grid
                let newGrid = grid.map(row => row.slice());
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
        const moves = [];
        const middle = 3;

        // Check middle column
        if (grid[0][middle] === 0) {
            const row = grid.findIndex(column => column[middle] === 0);
            if (row !== -1) {
                moves.push([middle, row]);
            }
        }

        // Check other columns
        for (const i of [1, 2, 3]) {
            const left = middle - i;
            const right = middle + i;
            if (grid[0][left] === 0) {
                const row = grid.findIndex(column => column[left] === 0);
                if (row !== -1) {
                    moves.push([left, row]);
                }
            }
            if (grid[0][right] === 0) {
                const row = grid.findIndex(column => column[right] === 0);
                if (row !== -1) {
                    moves.push([right, row]);
                }
            }
        }

        return moves;
    }
}

// TODO : optimize the code of the GridChecker class
class GridChecker {

    static win = 0b10; //2
    static draw = 0b01; //1
    static notOver = 0b00; //0

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
        return false;
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
        return false;
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
        return false;
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
        return false;
    }

    static checkDraw(grid) {
        for (let column = 0; column < width; column++) {
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
        // switch case is faster than if else
        switch (true) {
            case GridChecker.checkHorizontal(grid, row, column, color):
            case GridChecker.checkVertical(grid, row, column, color):
            case GridChecker.checkDiagonalBottomLeftTopRight(grid, row, column, color):
            case GridChecker.checkDiagonalTopRightBottomLeft(grid, row, column, color):
                return GridChecker.win;
            default:
                return GridChecker.notOver;
        }
    }
}

// TODO : need to put in spec later
export {AI}
