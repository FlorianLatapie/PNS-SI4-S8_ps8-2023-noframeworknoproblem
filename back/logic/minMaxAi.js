let width = 7;
let height = 6;

let ai;

function setup(AIplays) {
    ai = new AI();
    ai.setup(AIplays);
}

function nextMove(lastMove) {
    return ai.nextMove(lastMove);
}

class AI {

    setup(AIplays) {
        // need to initialize the grid
        // need to transform it later to improve performance
        this.player = AIplays;
        this.otherPlayer = AIplays === 1 ? 2 : 1;

        // initialize a grid with only 0 with a width of 7 and a height of 6
        this.grid = Array.from({length: height}, () => new Array(width).fill(0));
        return true;
    }

    nextMove(lastMove) {
        //console.log("lastMove : ", lastMove);
        //console.log("Before Human update : ", this.grid);
        this.startTimer = Date.now();
        if (JSON.stringify(lastMove) === JSON.stringify([])) {
            console.log("first if")
            this.grid[height-1][3] = this.player;
            return [3, 0];
        } else {
            // update the grid with the last move
            // need to convert the coordinates to the ai coordinates
            this.grid[height - 1 - lastMove[1]][lastMove[0]] = this.otherPlayer;

            //console.log("After Human update : ", this.grid);

            // make play the AI
            let bestMove = this.minMaxInit(4);
            //console.log("res of minMaxInit : ", bestMove);

            // update the grid with the AI move
            this.grid[bestMove[1]][bestMove[0]] = this.player;

            // need to convert the coordinates to the api coordinates
            bestMove = [bestMove[0], height - 1 - bestMove[1]];
            //console.log("move play by AI : ", bestMove);

            //console.log("After AI update : ", this.grid);
            return bestMove;
        }
    }

    minMaxInit(depth) {
        let alpha = Number.NEGATIVE_INFINITY;
        let beta = Number.POSITIVE_INFINITY;

        let maxEval = Number.NEGATIVE_INFINITY;
        let bestMove = null;
        // for each possible move
        //console.log("possible moves : ", moves);
        for (let move of GridMoves.possibleMoves(this.grid)) {
            if (Date.now() - this.startTimer < 75) {
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
        }
        //console.log("maxEval : ", maxEval);
        return bestMove;
    }

    minMax(grid, depth, isMaximizingPlayer, alpha, beta) {
        let endGame = GridChecker.isGameOver(grid);
        if (endGame === GridChecker.win) {
            if (isMaximizingPlayer) {
                // the player won
                return Number.NEGATIVE_INFINITY;
            } else {
                // the AI won
                return Number.POSITIVE_INFINITY;
            }
        } else if (endGame === GridChecker.draw) {
            // nobody won
            return 0;
        }

        if (depth === 0) {
            return this.evaluate(grid, this.player === 1);
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
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                if (out[i + j] === undefined) {
                    out[i + j] = [];
                }
                out[i + j].push(grid[i][j]);
            }
        }
        return out;
    }

    rotateminus45(grid) {
        let out = [];
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                if (out[i - j + grid.length - 1] === undefined) {
                    out[i - j + grid.length - 1] = [];
                }
                out[i - j + grid.length - 1].push(grid[i][j]);
            }
        }
        return out;
    }

    // also known as transpose
    // rotate vers la droite puis miroir horizontal
    rotate90(grid) {
        let out = [];
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                if (out[j] === undefined) {
                    out[j] = [];
                }
                out[j].push(grid[i][j]);
            }
        }
        return out;
    }

    findWinningMovesOnALine(lineOfConnect4, isAiPlayingFirst) {
        let knownWinningMoves1 = [
            ["1000", "0100", "0010", "0001"],
            ["1100", "0110", "0011", "1010", "0101", "1001"],
            ["0111", "1011", "1101", "1110"],
            //["1111"]
        ];
        let knownWinningMoves2 = [
            ["2000", "0200", "0020", "0002"],
            ["2200", "0220", "0022", "2020", "0202", "2002"],
            ["0222", "2022", "2202", "2220"],
            //["2222"]
        ];
        let score = 0;

        if (isAiPlayingFirst) {
            for (let i = 0; i < knownWinningMoves2.length; i++) {
                for (let j = 0; j < knownWinningMoves2[i].length; j++) {
                    let index = lineOfConnect4.indexOf(knownWinningMoves2[i][j]);
                    if (lineOfConnect4.indexOf("2222") !== -1) {
                        score -= 100000;
                    }
                    if (index !== -1) {
                        score -= 1 ** (i + 1);
                    }
                }
            }
            for (let i = 0; i < knownWinningMoves1.length; i++) {
                for (let j = 0; j < knownWinningMoves1[i].length; j++) {
                    let index = lineOfConnect4.indexOf(knownWinningMoves1[i][j]);
                    if (lineOfConnect4.indexOf("1111") !== -1) {
                        score += 100;
                    }
                    if (index !== -1) {
                        score += 1 * (i + 1);
                    }
                }
            }
        }
        else {
            for (let i = 0; i < knownWinningMoves1.length; i++) {
                for (let j = 0; j < knownWinningMoves1[i].length; j++) {
                    let index = lineOfConnect4.indexOf(knownWinningMoves1[i][j]);
                    if (lineOfConnect4.indexOf("1111") !== -1) {
                        score -= 100000;
                    }
                    if (index !== -1) {
                        score -= 1 ** (i + 1);
                    }
                }
            }
            for (let i = 0; i < knownWinningMoves2.length; i++) {
                for (let j = 0; j < knownWinningMoves2[i].length; j++) {
                    let index = lineOfConnect4.indexOf(knownWinningMoves2[i][j]);
                    if (lineOfConnect4.indexOf("2222") !== -1) {
                        score += 100;
                    }
                    if (index !== -1) {
                        score += 1 * (i + 1);
                    }
                }
            }
        }
        return score;
    }

    // This function returned the possible moves for the AI to play
    // the result is an array of elements being [column, row]

    // return an integer
    evaluate(grid, isAiPlayingFirst) {
        let grid90 = this.rotate90(grid);
        let grid45 = this.rotate45(grid);
        let gridM45 = this.rotateminus45(grid);


        let grids = [
            grid, // plus c'est bas plus ca vaut de points [0] difficile, [6] facile
            //grid90, // blc de la hauteur c'est indépendant
            grid45, // plus c'est bas plus ca vaut de points [0] difficile, [6] facile
            gridM45 // plus c'est bas plus ca vaut de points [0] difficile, [6] facile
        ];

        let score = 0;

        for (let j = 0; j < grid90.length; j++) {
            let line = grid90[j].join("");
            score += this.findWinningMovesOnALine(line, isAiPlayingFirst);
        }

        for (let i = 0; i < grids.length; i++) {
            let grid = grids[i];
            for (let j = 0; j < grid.length; j++) {
                let line = grid[j].join("");
                score += this.findWinningMovesOnALine(line, isAiPlayingFirst) * (grid.length - j);
            }
        }

        /*
        // Not working well
        let weightGrid = [
            [2, 3, 4, 5, 4, 3, 2],
            [3, 4, 5, 6, 5, 4, 3],
            [4, 5, 6, 7, 6, 5, 4],
            [5, 6, 7, 8, 7, 6, 5],
            [4, 5, 6, 7, 6, 5, 4],
            [3, 4, 5, 6, 5, 4, 3],
            [2, 3, 4, 5, 4, 3, 2]
        ];

        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                if (grid[i][j] === this.player) {
                    score += weightGrid[i][j];
                } else if (grid[i][j] === this.otherPlayer) {
                    score -= weightGrid[i][j] * 5;
                }
            }
        }*/
        /*console.log("printGrids >>>>>>>>>>>>>>>>>>>>>>>>>>");
        for (let i = 0; i < grids.length; i++) {
            printGrid(grids[i])
        }
*/
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
                //console.log("row middle ", row);
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

function printGrid(grid) {
    for (let i = 0; i < grid.length; i++) {
        console.log(grid[i].join(""));
    }
    console.log();
}

export {nextMove, setup, AI}
