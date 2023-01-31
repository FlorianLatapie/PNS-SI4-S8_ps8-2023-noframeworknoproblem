"use strict";

function Position(x, y) {
    this.x = x;
    this.y = y;
}

function Grid(width, height) {
    // Attributes ------------------------------------------------------------------------------------------------------
    const defaultCellValue = "_";
    const redCellValue = "R";
    const yellowCellValue = "Y";
    let hollowSpacesInColumns = [];

    // Methods ---------------------------------------------------------------------------------------------------------
    let createGrid = function () {
        hollowSpacesInColumns = [height - 1, height - 1, height - 1, height - 1, height - 1, height - 1, height - 1]; // bad
        let cells = new Array(height);

        for (let i = 0; i < height; i++) {
            cells[i] = new Array(width);
            for (let j = 0; j < width; j++) {
                let cell = document.getElementById(j + "-" + i);
                cells[i][j] = defaultCellValue;
                cell.setAttribute("value", cells[i][j]);
                cell.addEventListener("click", addDisc);
            }
        }
        return cells;
    }

    // here you should use "ge.playturn()"
    function addDisc() {
        // Check if we can place a disc in this column
        if (ge.isGameOver) {
            document.querySelectorAll(".grid-item").forEach(c => {
                c.removeEventListener("click", addDisc);
                c.style.cursor = "not-allowed";
            });
            return "Game is over";
        }

        let clickCoords = this.id.split("-");
        let chosenColumn = parseInt(clickCoords[0]); // ok
        let hollowSpacesInColumn = hollowSpacesInColumns[chosenColumn]; // bad

        if (hollowSpacesInColumn < 0) {
            return "Column is full";
        }

        // Place disc
        let cellX = chosenColumn; // ok
        let cellY = height - 1 - hollowSpacesInColumn; // bad
        let cell = document.getElementById(cellX + "-" + cellY); // ok

        cell.classList.add("fall");

        if (ge.currentPlayingPlayer.color === "R") {
            cell.classList.add("red-piece"); // ok
            ge.grid.cells[hollowSpacesInColumn][chosenColumn] = redCellValue; // bad
            ge.checkWin(hollowSpacesInColumn, chosenColumn, redCellValue); // bad
        } else {
            cell.classList.add("yellow-piece"); // ok
            ge.grid.cells[hollowSpacesInColumn][chosenColumn] = yellowCellValue; // bad
            ge.checkWin(hollowSpacesInColumn, chosenColumn, yellowCellValue); // bad
        }

        ge.currentPlayingPlayer = ge.getOtherPlayer(); // bad

        hollowSpacesInColumns[chosenColumn] -= 1;

        console.log(ge.grid.toString()); // ok
    }

    this.isColumnFull = function (column) {
        return this.cells[0][column] !== defaultCellValue;
    }

    this.isCellEmpty = function (x, y) {
        return this.cells[y][x] === defaultCellValue;
    }

    this.setCell = function (x, y, value) {
        this.cells[y][x] = value;
    }

    this.addDisk = function (player, column) {
        for (let row = this.height - 1; row >= 0; row--) {
            if (this.isCellEmpty(column, row)) {
                this.setCell(column, row, player.color);
                return new Position(column, row);
            }
        }
        throw new Error("Column " + column + " is full or cell not found, this should not happen");
    }

    this.toString = function () {
        let str = "";
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                str += this.cells[i][j];
            }
            str += "\n";
        }
        return str;
    }

    Object.defineProperty(this, "defaultCellValue", {
        get: function () {
            return defaultCellValue;
        }
    });

    Object.defineProperty(this, "redCellValue", {
        get: function () {
            return redCellValue;
        }
    });

    Object.defineProperty(this, "yellowCellValue", {
        get: function () {
            return yellowCellValue;
        }
    });

    // Constructor -----------------------------------------------------------------------------------------------------
    this.width = width;
    this.height = height;
    this.cells = createGrid();
}

function GridChecker(grid) {
    // Attributes ------------------------------------------------------------------------------------------------------
    this.grid = grid;

    // Methods ---------------------------------------------------------------------------------------------------------
    this.checkHorizontal = function (row, column, color) {
        let count = 0;
        for (let i = -3; i < 4; i++) {
            if (0 <= column + i && column + i < this.grid.width) {
                if (this.grid.cells[row][column + i] === color) {
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
    this.checkVertical = function (row, column, color) {
        let count = 0;
        for (let i = -3; i < 4; i++) {
            if (0 <= row + i && row + i < this.grid.height) {
                if (this.grid.cells[row + i][column] === color) {
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
    this.checkDiagonalBottomLeftTopRight = function (row, column, color) {
        let count = 0;
        for (let i = -3; i < 4; i++) {
            if (0 <= row - i && row - i < this.grid.height && 0 <= column + i && column + i < this.grid.width) {
                if (this.grid.cells[row - i][column + i] === color) {
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
    this.checkDiagonalTopRightBottomLeft = function (row, column, color) {
        let count = 0;
        for (let i = -3; i < 4; i++) {
            if (0 <= row + i && row + i < this.grid.height && 0 <= column + i && column + i < this.grid.width) {
                if (this.grid.cells[row + i][column + i] === color) {
                    count++;
                    if (count === 4) {
                        return true;
                    }
                } else {
                    count = 0;
                }
            }
        }

        if (count === 4) {
            return true;
        }

        count = 1;
        for (let i = 1; i < 4; i++) {
            if (0 <= row + i && row + i < this.grid.height && 0 <= column - i && column - i < this.grid.width) {
                if (this.grid.cells[row + i][column - i] === color) {
                    count++;
                }
            }
        }
        // code duplication
        if (count === 4) {
            return true;
        }

        count = 1;
        for (let i = 1; i < 4; i++) {
            if (0 <= row - i && row - i < this.grid.height && 0 <= column + i && column + i < this.grid.width) {
                if (this.grid.cells[row - i][column + i] === color) {
                    count++;
                }
            }
        }

        if (count === 4) {
            return true;
        }
    }

    this.checkDraw = function () {
        for (let column = 0; column < this.grid.width; column++) {
            if (!this.grid.isColumnFull(column)) {
                return false;
            }
        }
        this.isGameOver = true;
        let winner = document.getElementById("winner");
        winner.innerText = "Draw !"; // bad do not use html GameEngine
        return true;
    }
}

// class Player
function Player(name, id) {
    // Attributes
    this.name = name
    this.id = id
    this.color = "no"
}

// class GameEngine
function GameEngine(player1, player2) {
    // Attributes ------------------------------------------------------------------------------------------------------
    this.player1 = player1
    this.player2 = player2
    this.currentPlayingPlayer = player1
    this.grid = new Grid(7, 6);
    this.gridChecker = new GridChecker(this.grid);
    this.isGameOver = false;

    // Methods ---------------------------------------------------------------------------------------------------------
    this.getRandomPlayer = function (playersArray) {
        let index = Math.floor(Math.random() * playersArray.length)
        return playersArray[index]
    }

    this.getOtherPlayer = function () {
        if (this.currentPlayingPlayer === this.player1) {
            return this.player2
        } else if (this.currentPlayingPlayer === this.player2) {
            return this.player1
        } else {
            throw new Error("Invalid player");
        }
    }

    // Verify the end condition of the game
    this.checkWin = function (row, column, color) {
        if (this.gridChecker.checkHorizontal(row, column, color)
            || this.gridChecker.checkVertical(row, column, color)
            || this.gridChecker.checkDiagonalBottomLeftTopRight(row, column, color)
            || this.gridChecker.checkDiagonalTopRightBottomLeft(row, column, color)) {
            this.isGameOver = true;
            let winner = document.getElementById("winner");
            winner.innerText = color + " wins !"; // bad do not use html GameEngine
            return true;
        }
        this.gridChecker.checkDraw();
        return false;
    }



    // Play a turn for a player
    this.playTurn = function (player, column) {
        // Check errors before playing
        if (player !== this.currentPlayingPlayer) {
            throw new Error("It's not your turn");
        }
        if (column < 0 || column >= this.grid.width) {
            throw new Error("Invalid column : " + column);
        }
        if (this.grid.isColumnFull(column)) {
            throw new Error("Column " + column + " is full");
        }
        if (this.isGameOver) {
            throw new Error("Game is over");
        }

        // Play
        let positionCell = this.grid.addDisk(player, column)
        console.log(this.grid.toString())

        // Check win condition
        if (this.checkWin(positionCell.y, positionCell.x, player.color)) {
            console.log("Game Finished : " + player.name + " won");
        }

        // Check equality condition
        if (this.gridChecker.checkDraw()) {
            console.log("Game Finished : draw");
        }

        // Change the current player
        this.currentPlayingPlayer = this.getOtherPlayer()
    }

    // Constructor -----------------------------------------------------------------------------------------------------

    player1.color = this.grid.yellowCellValue;
    player2.color = this.grid.redCellValue;

    // The first player is randomly chosen
    this.currentPlayingPlayer = this.getRandomPlayer([player1, player2])
}

let p1 = new Player("alice", 0)
let p2 = new Player("bob", 1)
let ge = new GameEngine(p1, p2)

// A Win test
/*
ge.currentPlayingPlayer = p1
ge.playTurn(p1, 0)
ge.playTurn(p2, 0)
ge.playTurn(p1, 1)
ge.playTurn(p2, 1)
ge.playTurn(p1, 2)
ge.playTurn(p2, 2)
ge.playTurn(p1, 3)
*/


// An equality test
/*
ge.currentPlayingPlayer = p1
ge.playTurn(p1, 0)
ge.playTurn(p2, 1)
ge.playTurn(p1, 2)
ge.playTurn(p2, 3)
ge.playTurn(p1, 4)
ge.playTurn(p2, 5)
ge.playTurn(p1, 6)
ge.playTurn(p2, 1)
ge.playTurn(p1, 2)
ge.playTurn(p2, 3)
ge.playTurn(p1, 4)
ge.playTurn(p2, 5)
ge.playTurn(p1, 6)
ge.playTurn(p2, 2)
ge.playTurn(p1, 0)
ge.playTurn(p2, 0)
ge.playTurn(p1, 1)
ge.playTurn(p2, 4)
ge.playTurn(p1, 3)
ge.playTurn(p2, 6)
ge.playTurn(p1, 5)
ge.playTurn(p2, 0)
ge.playTurn(p1, 1)
ge.playTurn(p2, 2)
ge.playTurn(p1, 3)
ge.playTurn(p2, 4)
ge.playTurn(p1, 5)
ge.playTurn(p2, 6)
ge.playTurn(p1, 0)
ge.playTurn(p2, 1)
ge.playTurn(p1, 2)
ge.playTurn(p2, 3)
ge.playTurn(p1, 4)
ge.playTurn(p2, 5)
ge.playTurn(p1, 6)
ge.playTurn(p2, 0)
ge.playTurn(p1, 1)
ge.playTurn(p2, 2)
ge.playTurn(p1, 3)
ge.playTurn(p2, 4)
ge.playTurn(p1, 5)
ge.playTurn(p2, 6)
*/