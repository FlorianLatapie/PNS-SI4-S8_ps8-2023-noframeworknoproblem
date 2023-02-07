import {Position} from "./Position.js";

export default function Grid(width, height) {
    // Attributes ------------------------------------------------------------------------------------------------------
    const defaultCellValue = "_";
    const redCellValue = "R";
    const yellowCellValue = "Y";

    // Methods ---------------------------------------------------------------------------------------------------------
    let createGrid = function () {
        let cells = new Array(height);

        for (let i = 0; i < height; i++) {
            cells[i] = new Array(width);
            for (let j = 0; j < width; j++) {
                cells[i][j] = defaultCellValue;
            }
        }
        return cells;
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

    this.getRowOfLastDisk = function (column) {
        for (let row = 0; row < this.height; row++) {
            if (!this.isCellEmpty(column, row)) {
                return height - row;
            }
        }
        return 0;
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

    // Permits to retrieve the move of the other player
    this.findMove = function (otherGrid) {
        for (let column = 0; column < this.width; column++) {
            for (let row = 0; row < this.height; row++) {
                if (this.cells[+row][+column] !== otherGrid.cells[+row][+column]) {
                    return this.getGlobalPosition(column, row)
                }
            }
        }
    }

    this.getCellInGlobalCoordinated = function (row, column) {
        return this.cells[row][this.height - 1 - column]
    }

    this.getGlobalPosition = function (column, row) {
        return new Position(column, this.height - 1 - row)
    }

    // Setter only for these attributes --------------------------------------------------------------------------------
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
