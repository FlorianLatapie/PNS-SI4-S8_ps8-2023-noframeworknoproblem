let socket = io("http://localhost:8000/api/game")

socket.on("connect", () => {
    console.log("Connected as AI for a game vs human with ID: " + socket.id);
    socket.emit("join", "toto");
});


socket.on("newMove", (column, row) => {
    console.log("newMove", column, row);
    checkValidity(row, column);
    socket.emit("newMove", [column, row]);
});

socket.on("updatedBoard", globalCoordsGrid => {
    console.log("updatedBoard", globalCoordsGrid);
    //updateGrid(globalCoordsGrid);
}