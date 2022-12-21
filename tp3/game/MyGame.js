import { GameModel } from './GameModel.js';
import { MyBoard } from './MyBoard.js';
import { MyCheckerGroup } from './MyCheckerGroup.js';

export class MyGame {
    TILE_SIZE = 0.5;

    constructor(scene) {
        this.scene = scene;
        this.model = new GameModel(0); // TODO start time (depends on main menu logic probably)
        this.checkers = new MyCheckerGroup(scene, this.model, this.TILE_SIZE);
        this.board = new MyBoard(scene, this.TILE_SIZE);
    }

    display() {
        this.board.display();
        this.checkers.display();
    }
}
