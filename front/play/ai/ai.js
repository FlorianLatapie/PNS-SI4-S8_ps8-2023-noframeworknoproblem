let socket = io("http://localhost:8000")
console.log("titi");


socket.on("connect", () => {
    console.log("Connected");
    socket.emit("join", "toto");
});


socket.on("newMove", (column, row) => {
    console.log("newMove", column, row);
    checkValidity(row, column);
    socket.emit("newMove", [column, row]);

});
