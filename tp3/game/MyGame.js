import { MyBoard } from './MyBoard.js';

export class MyGame {
    constructor(scene) {
        this.board = new MyBoard(scene, 0.5);
    }

    display() {
        this.board.display();
    }
}
