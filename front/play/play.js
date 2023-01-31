"use strict";

function Position(x, y) {
    this.x = x;
    this.y = y;
}

function Grid(width, height) {
    // Attributes

    const defaultCellValue = "_";
    const redCellValue = "R";
    const yellowCellValue = "Y";
    let currColumns = [];

    // Methods
    let createGrid = function () {
        currColumns = [5,5,5,5,5,5,5];
        let cells = new Array(height);

        for (let i = 0; i < height; i++) {
            cells[i] = new Array(width);
            for (let j = 0; j < width; j++) {
                let cell = document.getElementById(j + "-" + i);
                //console.log(cell.id);
                //cells[i][j] = document.getElementById(i + "-" + j);
                //cells[i][j].setAttribute(defaultCellValue);
                cells[i][j] = defaultCellValue;
                cell.setAttribute("value", cells[i][j]);
                cell.addEventListener("click", addPiece);
            }
        }
        return cells;
    }

    function addPiece() {
        if(ge.isGameOver){
            document.querySelectorAll(".grid-item").forEach(
                c => {
                    c.removeEventListener("click", addPiece);
                    c.style.cursor = "not-allowed";
                });
            return;
        }

        let coords = this.id.split("-");
        let c = parseInt(coords[0]);
        let r = parseInt(coords[1]);

        r = currColumns[c];

        if (r < 0) {
            return;
        }

        let cell = document.getElementById(c + "-" + (5-r));
        cell.classList.add("fall");
        if (ge.currentPlayingPlayer.color === "R") {
            cell.classList.add("red-piece");
            ge.grid.cells[r][c] = redCellValue;
            ge.checkWin(r, c, redCellValue);
            ge.currentPlayingPlayer = ge.getOtherPlayer();
        }
        else {
            cell.classList.add("yellow-piece");
            ge.grid.cells[r][c] = yellowCellValue;
            ge.checkWin(r, c, yellowCellValue);
            ge.currentPlayingPlayer = ge.getOtherPlayer();
        }
        ge.checkEquality();
        r -= 1;
        currColumns[c] = r;

        console.log(ge.grid.toString());

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
        let str = ""
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                str += this.cells[i][j]
            }
            str += "\n"
        }
        return str
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

    this.width = width;
    this.height = height;
    this.cells = createGrid();
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
    // Attributes
    this.player1 = player1
    this.player2 = player2
    this.currentPlayingPlayer = player1
    this.grid = new Grid(7, 6);
    this.isGameOver = false;

    // Methods
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

    // responsabilité de la grille et non du moteur de jeu : moteur de jeu : gérer grille et joueur
    // grille : poser des trucs et check son propre contenu
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

    // Verify the end condition of the game
    this.checkWin = function (row, column, color) {
        if (this.checkHorizontal(row, column, color)
            || this.checkVertical(row, column, color)
            || this.checkDiagonalBottomLeftTopRight(row, column, color)
            || this.checkDiagonalTopRightBottomLeft(row, column, color))
        {
            this.isGameOver = true;
            let winner = document.getElementById("winner");
            winner.innerText = color + " wins !";
            return true;
        }
        return false;
    }

    this.checkEquality = function () {
        for (let column = 0; column < this.grid.width; column++) {
            if (!this.grid.isColumnFull(column)) {
                return false;
            }
        }
        this.isGameOver = true;
        let winner = document.getElementById("winner");
        winner.innerText = "Equality !";
        return true;
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
        if (this.checkEquality()) {
            console.log("Game Finished : equality");
        }

        // Change the current player
        this.currentPlayingPlayer = this.getOtherPlayer()
    }

    // Code executed in constructor

    // The first player is randomly chosen
    this.currentPlayingPlayer = this.getRandomPlayer([player1, player2])

    // Color of the player beginning : yellow
    if (this.currentPlayingPlayer === player1) {
        this.player1.color = this.grid.yellowCellValue
        this.player2.color = this.grid.redCellValue
    } else {
        this.player1.color = this.grid.redCellValue
        this.player2.color = this.grid.yellowCellValue
    }


}

let p1 = new Player("alice", 0)
let p2 = new Player("bob", 1)
let ge = new GameEngine(p1, p2)

// A Win test
/*
ge.playTurn(p1, 0)
ge.playTurn(p2, 0)
ge.playTurn(p1, 1)
ge.playTurn(p2, 1)
ge.playTurn(p1, 2)
ge.playTurn(p2, 2)
ge.playTurn(p1, 3)
 */



// A equality test
/*
ge.playTurn(p1, 0)
ge.playTurn(p2, 1)
ge.playTurn(p1, 2)
ge.playTurn(p2, 3)
ge.playTurn(p1, 4)
ge.playTurn(p2, 5)
ge.playTurn(p1, 6)

ge.playTurn(p2, 1)
ge.playTurn(p1, 0)
ge.playTurn(p2, 3)
ge.playTurn(p1, 2)
ge.playTurn(p2, 5)
ge.playTurn(p1, 4)
ge.playTurn(p2, 6)
 */

