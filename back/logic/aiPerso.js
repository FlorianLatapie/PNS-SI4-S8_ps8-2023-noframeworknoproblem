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
        this.grid = Array.from({length: height}, () => new Array(width).fill(0));
        console.log("Setup grid ", this.grid);
        return true;
    }

    nextMove(lastMove) {
        console.log("lastMove : ", lastMove);
        console.log("Before Human update : ", this.grid);
        if (lastMove !== null) {
            // update the grid with the last move
            // need to convert the coordinates to the ai coordinates
            this.grid[height - 1 - lastMove[1]][lastMove[0]] = this.otherPlayer;
        }

        console.log("After Human update : ", this.grid);

        // make play the AI
        let bestMove = this.minMaxInit(this.grid, 2);
        console.log("res of minMaxInit : ", bestMove);

        // update the grid with the AI move
        this.grid[bestMove[1]][bestMove[0]] = this.player;

        // need to convert the coordinates to the api coordinates
        bestMove = [bestMove[0], height - 1 - bestMove[1]];
        console.log("move play by AI : ", bestMove);

        console.log("After AI update : ", this.grid);
        return bestMove;
    }

    minMaxInit(grid, depth) {
        let alpha = Number.NEGATIVE_INFINITY;
        let beta = Number.POSITIVE_INFINITY;

        let maxEval = Number.NEGATIVE_INFINITY;
        let bestMove = null;
        // for each possible move
        let moves = GridMoves.possibleMoves(grid);
        console.log("possible moves : ", moves);
        for (let move of moves) {
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
        const moves = [];
        const middle = 3;

        // Check middle column

        for (let row = height - 1; row >= 0; row--) {
            if (grid[row][middle] === 0) {
                console.log("row middle ", row);
                moves.push([middle, row]);
                break;
            }
        }


        // Check other columns
        for (const i of [1, 2, 3]) {
            const left = middle - i;
            const right = middle + i;

            for (let row = height - 1; row >= 0; row--) {
                if (grid[row][left] === 0) {
                    moves.push([left, row]);
                    break;
                }
            }


            for (let row = height - 1; row >= 0; row--) {
                if (grid[row][right] === 0) {
                    moves.push([right, row]);
                    break;
                }
            }

        }
        console.log("Res possibles moves ", moves);
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
        const rowArray = grid[row];
        const left = Math.max(column - 3, 0);
        const right = Math.min(column + 3, width - 1);

        for (let i = left; i <= right; i++) {
            if (rowArray[i] === color) {
                count++;
                if (count === 4) {
                    return true;
                }
            } else {
                count = 0;
            }
        }
        return false;
    }

    static checkVertical(grid, row, column, color) {
        let count = 0;
        const top = Math.max(row - 3, 0);
        const bottom = Math.min(row + 3, height - 1);

        for (let i = top; i <= bottom; i++) {
            if (grid[i][column] === color) {
                count++;
                if (count === 4) {
                    return true;
                }
            } else {
                count = 0;
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

        //TODO : check if this function is correct
        /*
        let count = 0;
        const diagonalLength = Math.min(3, width - row, column + 1, height - row, width - column);

        for (let i = 0; i < diagonalLength + 4; i++) {
            const rowIndex = row - i + diagonalLength;
            const columnIndex = column + i - diagonalLength;

            if (rowIndex >= 0 && rowIndex < height && columnIndex >= 0 && columnIndex < width) {
                if (grid[rowIndex][columnIndex] === color) {
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
         */
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

        //TODO : check if this function is correct
        /*
        let count = 0;
        // width being the minimum dimension of the grid
        const diagonalLength = Math.min(3, width - row, width - column, row + 1, column + 1);

        for (let i = 0; i < diagonalLength + 4; i++) {
            const rowIndex = row + i - diagonalLength;
            const columnIndex = column + i - diagonalLength;

            if (rowIndex >= 0 && rowIndex < height && columnIndex >= 0 && columnIndex < width) {
                if (grid[rowIndex][columnIndex] === color) {
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
         */
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
