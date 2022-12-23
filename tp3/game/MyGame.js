import { GameModel } from './GameModel.js';
import { MyAnimatedCross } from './MyAnimatedCross.js';
import { MyBoard } from './MyBoard.js';
import { MyCheckerGroup } from './MyCheckerGroup.js';

export class MyGame {
    TILE_SIZE = 0.5;

    constructor(scene) {
        this.scene = scene;
        this.model = new GameModel(this, 0); // TODO start time (depends on main menu logic probably)
        this.checkers = new MyCheckerGroup(scene, this.model, this.TILE_SIZE);
        this.board = new MyBoard(scene, this.model, this.TILE_SIZE);

        this.crosses = new Set();
    }

    makeCross(x, y) {
        let height = 0.01;
        if (this.model.isQueen(x, y)) {
            height = 0.21;
        } else if (this.model.isRegular(x, y)) {
            height = 0.11;
        }
        const cross = new MyAnimatedCross(this.scene, x, y, this.TILE_SIZE, () => {
            this.crosses.delete(cross);
        }, height);

        this.crosses.add(cross);
        cross.start(this.model.current_time);
    }

    update(t) {
        this.model.update(t);
    }

    display(pickMode) {
        if (!pickMode) {
            this.crosses.forEach(cross => cross.display());
        }
        
        this.board.display(pickMode);
        this.checkers.display();     
    }
}
