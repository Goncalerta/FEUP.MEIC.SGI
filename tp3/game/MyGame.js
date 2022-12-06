import { MyBoard } from './MyBoard.js';
import { MyChecker } from './MyChecker.js';
import { CGFappearance, CGFtexture } from '../../lib/CGF.js';


export class MyGame {
    constructor(scene) {
        this.scene = scene;
        this.board = new MyBoard(scene);

        // TODO just to test, remove later vv
        this.checker = new MyChecker(scene, 2, 1, 50, 10);        
        // ^^
    }

    display() {
        this.board.display();

        // TODO just to test, remove later vv
        this.scene.pushMatrix();
        this.checker.display();
        this.scene.popMatrix();
        // ^^
    }
}
