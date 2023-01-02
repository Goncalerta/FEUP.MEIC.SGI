import { GameModel } from './GameModel.js';
import { MyAnimatedCross } from './MyAnimatedCross.js';
import { MyBoard } from './MyBoard.js';
import { MyCheckerGroup } from './MyCheckerGroup.js';
import { MyDiscardBoard } from './MyDiscardBoard.js';
import { MyScoreBoard } from './menu/MyScoreBoard.js';
import { Player } from './Player.js';
import { MyGameCameras } from './MyGameCameras.js';

/**
 * MyGame class, representing the game.
 */
export class MyGame {
    TILE_SIZE = 0.5;
    DISCARD_BOARD_GAP = 0.15;

    /**
     * @constructor
     * @param {CGFscene} scene - MyScene object
     * @param {function} playCallBack - function to call to go back to the main menu
     * @param {string} player1Name - player 1 name
     * @param {string} player2Name - player 2 name
     */
    constructor(scene, playCallBack, player1Name=Player.PLAYER_1_DEFAULT_NAME, player2Name=Player.PLAYER_2_DEFAULT_NAME) {
        this.scene = scene;

        this.player1 = new Player(1, player1Name);
        this.player2 = new Player(2, player2Name);

        const startTime = new Date().getTime();
        this.model = new GameModel(this, startTime, this.player1, this.player2);
        this.checkers = new MyCheckerGroup(scene, this.model, this.player1, this.player2, this.TILE_SIZE);
        this.board = new MyBoard(scene, this.model, this.TILE_SIZE);

        const discardBoardZ = this.board.realHalfSize + this.DISCARD_BOARD_GAP;
        this.player1DiscardBoard = new MyDiscardBoard(scene, this.board.realHalfSize, this.TILE_SIZE, [0, 0, discardBoardZ], 1);
        this.player2DiscardBoard = new MyDiscardBoard(scene, this.board.realHalfSize, this.TILE_SIZE, [0, 0, -discardBoardZ], -1);

        this.cameras = new MyGameCameras(scene);
        this.scoreBoard = new MyScoreBoard(scene, this, this.cameras, this.player1, this.player2, playCallBack);

        this.crosses = new Set();
    }

    /**
     * Sets the spotlight position.
     * @param {number} x - Spotlight x position
     * @param {number} y - Spotlight y position
     */
    setSpotlightPosition(x, y) {
        this.scene.setGameSpotlightPosition(x, y);
    }

    /**
     * Enables the spotlight.
     */
    enableSpotlight() {
        this.scene.updateGameSpotlight(true);
    }

    /**
     * Disables the spotlight.
     */
    disableSpotlight() {
        this.scene.updateGameSpotlight(false);
    }

    /**
     * Generates an animated cross at the given position.
     * @param {number} x - Cross x position
     * @param {number} y - Cross y position
     */
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

    /**
     * Returns the discard board of the given player.
     * @param {number} playerId - Player id
     * @returns {MyDiscardBoard} Discard board
     */
    getDiscardBoard(playerId) {
        if (playerId == 1) {
            return this.player1DiscardBoard;
        } else if (playerId == 2) {
            return this.player2DiscardBoard;
        }
    }

    /**
     * Returns the checker at the given position.
     * @param {number} x - Checker x position
     * @param {number} y - Checker y position
     * @returns {MyChecker} Checker
     */
    getChecker(x, y) {
        return this.checkers.getChecker(x, y);
    }

    /**
     * Updates the game state.
     * @param {number} t - Current time
     */
    update(t) {
        this.model.update(t);

        if (this.model.state.spotlightOn()) {
            this.enableSpotlight();
            this.setSpotlightPosition(...this.model.state.spotlightOn());
        } else {
            this.disableSpotlight();
        }
    }

    /**
     * Displays the game.
     * @param {boolean} pickMode - True if in pick mode, false otherwise
     */
    display(pickMode) {
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.translate(0, 1, -this.TILE_SIZE * (this.model.BOARD_SIZE / 2 + 2) );
        this.scoreBoard.display(pickMode);
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
