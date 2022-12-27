import { CGFcamera } from '../../lib/CGF.js';
import { degreeToRad } from '../utils.js';
import { GameModel } from './GameModel.js';
import { MyAnimatedCross } from './MyAnimatedCross.js';
import { MyBoard } from './MyBoard.js';
import { MyCheckerGroup } from './MyCheckerGroup.js';
import { MyDiscardBoard } from './MyDiscardBoard.js';
import { MyScoreBoard } from './MyScoreBoard.js';
import { Player } from './Player.js';
import { MyGameCameras } from './MyGameCameras.js';

export class MyGame {
    TILE_SIZE = 0.5;
    DISCARD_BOARD_GAP = 0.15;

    constructor(scene) {
        this.scene = scene;

        // TODO just testing the names
        this.player1 = new Player(1, "DIOGO");
        this.player2 = new Player(2, "PEDRO");

        const startTime = new Date().getTime(); // TODO start time (depends on main menu logic probably)
        this.model = new GameModel(this, startTime, this.player1, this.player2);
        this.checkers = new MyCheckerGroup(scene, this.model, this.player1, this.player2, this.TILE_SIZE);
        this.board = new MyBoard(scene, this.model, this.TILE_SIZE);

        const discardBoardZ = this.board.realHalfSize + this.DISCARD_BOARD_GAP;
        this.player1DiscardBoard = new MyDiscardBoard(scene, this.board.realHalfSize, this.TILE_SIZE, [0, 0, discardBoardZ], 1);
        this.player2DiscardBoard = new MyDiscardBoard(scene, this.board.realHalfSize, this.TILE_SIZE, [0, 0, -discardBoardZ], -1);

        this.cameras = new MyGameCameras(scene);
        this.scoreBoard = new MyScoreBoard(scene, this.model, this.cameras, this.player1, this.player2, 6, 2, 1);

        this.crosses = new Set();
    }

    setSpotlightPosition(x, y) {
        this.scene.setGameSpotlightPosition(x, y);
    }

    enableSpotlight() {
        this.scene.updateGameSpotlight(true);
    }

    disableSpotlight() {
        this.scene.updateGameSpotlight(false);
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

    getDiscardBoard(playerId) {
        if (playerId == 1) {
            return this.player1DiscardBoard;
        } else if (playerId == 2) {
            return this.player2DiscardBoard;
        }
    }

    getChecker(x, y) {
        return this.checkers.getChecker(x, y);
    }

    update(t) {
        this.model.update(t);

        if (this.model.state.spotlightOn()) {
            this.enableSpotlight();
            this.setSpotlightPosition(...this.model.state.spotlightOn());
        } else {
            this.disableSpotlight();
        }
    }

    display(pickMode) {
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.translate(0, 1, -this.TILE_SIZE * (this.model.BOARD_SIZE / 2 + 2) );
        this.scoreBoard.display();
        this.scene.popMatrix();

        this.player1DiscardBoard.display();
        this.player2DiscardBoard.display();

        if (!pickMode) {
            this.crosses.forEach(cross => cross.display());
        }

        this.board.display(pickMode);
        this.checkers.display();
    }
}
