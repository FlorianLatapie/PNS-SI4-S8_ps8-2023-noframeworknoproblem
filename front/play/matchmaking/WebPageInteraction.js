import Grid from "../../GameLogic/Grid.js";

class WebPageInteraction {

    #grid
    #socketMatchmaking;

    constructor(grid) {
        this.#grid = grid;
        console.log("WebPageInteraction constructor grid ", grid)
        this.addListeners();
    }

    setSocketMatchmaking = (socketMatchmaking) => {
        this.#socketMatchmaking = socketMatchmaking;
    }

    updateWebPageGrid = (column, row, color) => {
        let cell = document.getElementById(column + "-" + row);

        cell.classList.add("fall");
        if (color === Grid.redCellValue) {
            cell.classList.add("red-piece");
        } else {
            cell.classList.add("yellow-piece");
        }
    }

    updateWebPageEntireGrid = (grid) => {
        for (let column = 0; column < grid.width; column++) {
            for (let line = grid.height - 1; line >= 0; line--) {
                let pos = grid.getGlobalPosition(column, line)

                let cell = document.getElementById(pos.column + "-" + pos.row);
                if (grid.cells[line][column] === Grid.redCellValue) {
                    cell.classList.add("red-piece");
                } else if (grid.cells[line][column] === Grid.yellowCellValue) {
                    cell.classList.add("yellow-piece");
                } else {
                    break;
                }
            }
        }
    }

    webPagePlayTurn = (event) => {
        let clickCoords = event.target.id.split("-");
        let column = clickCoords[1];
        let row = clickCoords[0];
        this.play(column, row); // need to send something via the socket
    }

    addListeners = () => {
        for (let column = 0; column < this.#grid.width; column++) {
            for (let line = 0; line < this.#grid.height; line++) {
                let cell = document.getElementById(column + "-" + line);
                cell.setAttribute("value", Grid.defaultCellValue);
                cell.style.cursor = "pointer";
                cell.addEventListener("click", this.webPagePlayTurn);
            }
        }
    }

    removeListeners = () => {
        document.querySelectorAll(".grid-item").forEach(c => {
            c.removeEventListener("click", this.webPagePlayTurn);
            c.style.cursor = "not-allowed";
        });
    }

    play = (clickRow, clickColumn) => {
        let column = clickColumn;
        let row = this.#grid.getRowOfLastDisk(column);
        this.#socketMatchmaking.newMoveEmit(column, row);
    }
}

export default WebPageInteraction;
