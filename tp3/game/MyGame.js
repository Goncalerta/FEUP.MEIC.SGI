import { MyBoard } from './MyBoard.js';

export class MyGame {
    constructor(scene) {
        this.board = new MyBoard(scene);
    }

    display() {
        this.board.display();
    }
}
