export default class GameRoom {
  constructor(emitter) {
    this.emitter = (updatedBoard) => {
      emitter.emit('updatedBoard', updatedBoard);
    };
  }
}
