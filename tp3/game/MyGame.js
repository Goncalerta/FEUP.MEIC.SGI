import { GameModel } from './GameModel.js';
import { MyAnimatedCross } from './MyAnimatedCross.js';
import { MyBoard } from './MyBoard.js';
import { MyCheckerGroup } from './MyCheckerGroup.js';
import { MyScoreBoard } from './MyScoreBoard.js';
import { Player } from './Player.js';

export class MyGame {
    TILE_SIZE = 0.5;

    constructor(scene) {
        this.scene = scene;

        // TODO just testing the names
        this.player1 = new Player(1, "DIOGO");
        this.player2 = new Player(2, "PEDRO");

        const startTime = new Date().getTime(); // TODO start time (depends on main menu logic probably)
        this.model = new GameModel(this, startTime, this.player1, this.player2);
        this.checkers = new MyCheckerGroup(scene, this.model, this.TILE_SIZE);
        this.board = new MyBoard(scene, this.model, this.TILE_SIZE);

        this.scoreBoard = new MyScoreBoard(scene, this.model, this.player1, this.player2, 5, 2);

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
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.translate(0, 1, -this.TILE_SIZE * (this.model.BOARD_SIZE / 2 + 2) );
        this.scoreBoard.display();
        this.scene.popMatrix();


        if (!pickMode) {
            this.crosses.forEach(cross => cross.display());
        }

        this.board.display(pickMode);
        this.checkers.display();
    }
}
