import Grid from "../../GameLogic/Grid.js";
import WebPageInteractionPVP from "../WebPageInteractionPVP.js";
import SocketMatchmaking from "./SocketMatchmaking.js";

let grid = new Grid(7, 6);
//let gameSocket = io("/api/game", {auth: {token: localStorage.getItem("token")}});

let webPageInteraction = new WebPageInteractionPVP(grid);
let socketMatchmaking = new SocketMatchmaking(webPageInteraction, grid);
webPageInteraction.setSocket(socketMatchmaking);

socketMatchmaking.startGame();

