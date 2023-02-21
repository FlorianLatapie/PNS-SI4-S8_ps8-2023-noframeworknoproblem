let width = 7;
let height = 6;

class AI {

    setup(AIplays) {
        // need to initialize the grid
        // need to transform it later to improve performance
        //console.log(`AI setup : ${AIplays}`);
        this.player = AIplays;
        this.otherPlayer = AIplays === 1 ? 2 : 1;

        // initialize a grid with only 0 with a width of 7 and a height of 6
        this.grid = Array.from({length: height}, () => new Array(width).fill(0));
        //console.log("Setup grid ", this.grid);
        return true;
    }

    nextMove(lastMove) {
        //console.log("lastMove : ", lastMove);
        //console.log("Before Human update : ", this.grid);
        if (lastMove !== null) {
            // update the grid with the last move
            // need to convert the coordinates to the ai coordinates
            if (this.grid === undefined){
                //console.log("grid is undefined")
            }
            this.grid[height - 1 - lastMove[1]][lastMove[0]] = this.otherPlayer;
        }

        //console.log("After Human update : ", this.grid);

        // make play the AI
        let bestMove = this.minMaxInit(this.grid, 5);
        //console.log("res of minMaxInit : ", bestMove);

        // update the grid with the AI move
        this.grid[bestMove[1]][bestMove[0]] = this.player;

        // need to convert the coordinates to the api coordinates
        bestMove = [bestMove[0], height - 1 - bestMove[1]];
        //console.log("move play by AI : ", bestMove);

        //console.log("After AI update : ", this.grid);
        return bestMove;
    }

    minMaxInit(grid, depth) {
        let alpha = Number.NEGATIVE_INFINITY;
        let beta = Number.POSITIVE_INFINITY;

        let maxEval = Number.NEGATIVE_INFINITY;
        let bestMove = null;
        // for each possible move
        //console.log("possible moves : ", moves);
        for (let move of GridMoves.possibleMoves(grid)) {
            // make a shadow copy of the grid
            let newGrid = this.grid.map(row => row.slice());
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
        // TODO : change the value of the evaluation function here
        if (endGame === GridChecker.win) {
            if (isMaximizingPlayer) {
                // the player won
                return -1;
            } else {
                // the AI won
                return 1;
            }
        } else if (endGame === GridChecker.draw) {
            // nobody won
            return 0;
        }

        if (isMaximizingPlayer) {
            let maxEval = Number.NEGATIVE_INFINITY;
            // for each possible move
            for (let move of GridMoves.possibleMoves(grid)) {
                //console.log(move);
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

    rotate45(grid) {
        let out = [];
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (out[i + j] === undefined) {
                    out[i + j] = [];
                }
                out[i + j].push(grid[i][j]);
            }
        }
        return out;
    }

    // also known as transpose
    rotate90(grid){
        let out = [];
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (out[j] === undefined) {
                    out[j] = [];
                }
                out[j].push(grid[i][j]);
            }
        }
        return out;
    }

    findWinningMovesOnALine(lineOfConnect4) {
        let knownWinningMoves1 = [
            ["1000", "0100", "0010", "0001"],
            ["1100", "0110", "0011", "1010", "0101", "1001"],
            ["0111", "1011", "1101", "1110"],
            ["1111"]
        ];
        let knownWinningMoves2 = [
            ["2000", "0200", "0020", "0002"],
            ["2200", "0220", "0022", "2020", "0202", "2002"],
            ["0222", "2022", "2202", "2220"],
            ["2222"]
        ];
        let score = 0;

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < knownWinningMoves1[i].length; j++) {
                let index = lineOfConnect4.indexOf(knownWinningMoves1[i][j]);
                if (index !== -1) {
                    score -= 100 ** (i + 1);
                }
            }
        }
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < knownWinningMoves2[i].length; j++) {
                let index = lineOfConnect4.indexOf(knownWinningMoves2[i][j]);
                if (index !== -1) {
                    score += 100 * (i + 1);
                }
            }
        }
        return score;
    }

    // This function returned the possible moves for the AI to play
    // the result is an array of elements being [column, row]

    // return an integer
    evaluate(grid) {
        let grid90 = this.rotate90(grid);
        let grid45 = this.rotate45(grid);
        let grid135 = this.rotate90(grid45);

        let grids = [grid, grid90, grid45, grid135];
        let score = 0;

        for (let i = 0; i < grids.length; i++) {
            let row = grids[i];
            for (let j = 0; j < row.length; j++) {
                let line = row[j].join("");
                score += this.findWinningMovesOnALine(line);
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
        //console.log("Res possibles moves ", moves);
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
            let rowIndex = row - i;
            let columnIndex = column + i;
            if (0 <= rowIndex && rowIndex < height && 0 <= columnIndex && columnIndex < width) {
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
    }


    static checkDiagonalTopRightBottomLeft(grid, row, column, color) {
        let count = 0;
        for (let i = -3; i < 4; i++) {
            let rowIndex = row + i;
            let columnIndex = column + i;
            if (0 <= rowIndex && rowIndex < height && 0 <= columnIndex && columnIndex < width) {
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
    }

    static checkDraw(grid) {
        let firstRow = grid[0];
        for (let column = 0; column < width; column++) {
            if (firstRow[column] === 0) {
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
