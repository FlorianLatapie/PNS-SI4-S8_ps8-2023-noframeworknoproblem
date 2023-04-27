import {Position} from "./Position.js";

export default class Grid {
    // Attributes ------------------------------------------------------------------------------------------------------
    static defaultCellValue = "0";
    static redCellValue = "2";
    static yellowCellValue = "1";

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cells = this.createGrid();
    }

    // Methods ---------------------------------------------------------------------------------------------------------
    createGrid = () => {
        let cells = new Array(this.height);

        for (let i = 0; i < this.height; i++) {
            cells[i] = new Array(this.width);
            for (let j = 0; j < this.width; j++) {
                cells[i][j] = Grid.defaultCellValue;
            }
        }
        return cells;
    }

    isColumnFull = (column) => {
        return this.cells[0][column] !== Grid.defaultCellValue;
    }

    isCellEmpty = (x, y) => {
        return this.cells[y][x] === Grid.defaultCellValue;
    }

    setCell = (x, y, value) => {
        this.cells[y][x] = value;
    }

    addDisk = (player, column) => {
        for (let row = this.height - 1; row >= 0; row--) {
            if (this.isCellEmpty(column, row)) {
                this.setCell(column, row, player.color);
                return new Position(column, row);
            }
        }
        throw new Error("Column " + column + " is full or cell not found, this should not happen");
    }

    getRowOfLastDisk = (column) => {
        for (let row = 0; row < this.height; row++) {
            if (!this.isCellEmpty(column, row)) {
                return this.height - row;
            }
        }
        return 0;
    }

    toString = () => {
        let str = "";
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.cells[i][j] === Grid.defaultCellValue) {
                    str += "_";
                } else if (this.cells[i][j] === Grid.redCellValue) {
                    str += "R";
                } else if (this.cells[i][j] === Grid.yellowCellValue) {
                    str += "Y";
                } else {
                    str += "?";
                }
            }
            str += "\n";
        }
        return str;
    }

    // compare this.grid with otherGrid and return the position of the first different cell to find the last move of the opponent
    findMove = (otherCells) => {
        for (let column = 0; column < this.width; column++) {
            for (let row = 0; row < this.height; row++) {
                if (this.cells[+row][+column] !== otherCells[+row][+column]) {
                    return this.getGlobalPosition(column, row)
                }
            }
        }
    }

    getCellInGlobalCoordinated = (row, column) => {
        return this.cells[row][this.height - 1 - column]
    }

    getGlobalPosition = (column, row) => {
        return new Position(column, this.height - 1 - row)
    }
}
