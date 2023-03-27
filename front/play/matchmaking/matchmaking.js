import Grid from "../../GameLogic/Grid.js";
import WebPageInteraction from "./WebPageInteraction.js";
import SocketMatchmaking from "./SocketMatchmaking.js";

let grid = new Grid(7, 6);
//let gameSocket = io("/api/game", {auth: {token: localStorage.getItem("token")}});

let webPageInteraction = new WebPageInteraction(grid);
let socketMatchmaking = new SocketMatchmaking(webPageInteraction, grid);
webPageInteraction.setSocketMatchmaking(socketMatchmaking);

socketMatchmaking.startGame();

