import { MyBoard } from './MyBoard.js';
import { MyChecker } from './MyChecker.js';

export class MyGame {
    constructor(scene) {
        this.scene = scene;
        this.board = new MyBoard(scene, 0.5);

        // TODO just to test, remove later vv
        this.checker = new MyChecker(scene, 2, 1, 1, 50, 10);        
        // ^^
    }

    display() {
        this.board.display();

        // TODO just to test, remove later vv
        this.checker.display();
        // ^^
    }
}
