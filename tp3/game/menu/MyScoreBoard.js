import { secondsToFormattedTime } from '../../utils.js';
import { Dimensions, MyMenu } from './MyMenu.js';
import { MyButton } from '../labels/MyButton.js';
import { MyLabelButton } from '../labels/MyLabelButton.js';
import { CONFIG } from '../config.js';
import { GameOverState } from '../GameState.js';
import { Player } from '../Player.js';

/**
 * MyScoreBoard class, representing the score board of the game.
 */
export class MyScoreBoard extends MyMenu {
    UNDO_TEXTURE_PATH = "scenes/images/game/undo.png";
    SCENARIO_TEXTURE_PATH = "scenes/images/game/scenario.png";
    POV_TEXTURE_PATH = "scenes/images/game/pov.png";
    PLAY_TEXTURE_PATH = "scenes/images/game/play.png";
    FRONTAL_TEXTURE_PATH = "scenes/images/game/front.png";

    MAX_CHAR_NAME = Player.PLAYER_LENGTH;
    MAX_SCORE_SIZE = 2;
    TEXT_COLOR_RGBA = [1, 1, 0.9, 1];
    DELTA_TEXT = 0.1;

    /**
     * @constructor
     * @param {CGFscene} scene - MyScene object
     * @param {MyGame} game - MyGame object
     * @param {MyGameCameras} cameras - MyGameCameras object
     * @param {Player} player1 - Player 1 object
     * @param {Player} player2 - Player 2 object
     * @param {function} playCallBack - callback function to return to the main menu
     */
    constructor(scene, game, cameras, player1, player2, playCallBack) {
        super(scene);

        this.gameModel = game.model;
        this.player1 = player1;
        this.player2 = player2;

        this.player1NameShort = player1.getName().substring(0, this.MAX_CHAR_NAME);
        this.player2NameShort = player2.getName().substring(0, this.MAX_CHAR_NAME);

        // buttons
        let pickingId = 401;
        const getChecker = game.getChecker.bind(game);
        this.undoButton  = new MyButton(scene, pickingId++, () => { game.model.state.triggerUndo(getChecker) }, this.UNDO_TEXTURE_PATH, this.TEXT_COLOR_RGBA);
        this.playButton  = new MyButton(scene, pickingId++, () => { game.model.state.triggerReplay(getChecker) }, this.PLAY_TEXTURE_PATH, this.TEXT_COLOR_RGBA);
        this.scenarioButton = new MyButton(scene, pickingId++, () => { playCallBack(CONFIG.menu) }, this.SCENARIO_TEXTURE_PATH, this.TEXT_COLOR_RGBA);
        this.frontalPOVButton = new MyButton(scene, pickingId++, () => { cameras.setFrontCamera() }, this.FRONTAL_TEXTURE_PATH, this.TEXT_COLOR_RGBA);
        this.p1POVButton = new MyButton(scene, pickingId++, () => { cameras.setPlayerCamera(1) }, this.POV_TEXTURE_PATH, this.TEXT_COLOR_RGBA);
        this.p2POVButton = new MyButton(scene, pickingId++, () => { cameras.setPlayerCamera(2) }, this.POV_TEXTURE_PATH, this.TEXT_COLOR_RGBA);

        // labels
        this.totalTimeLabel = new MyLabelButton(scene, () => { return `TIME  ${secondsToFormattedTime(this.gameModel.getGameTime())}` }, this.scenarioButton, this.getShader(), this.TEXT_COLOR_RGBA);
        this.capturesLabel = new MyLabelButton(scene, () => { return `   CAPTURES` }, this.frontalPOVButton,  this.getShader(), this.TEXT_COLOR_RGBA);
        this.player1Label = new MyLabelButton(scene, () => { return `${this.player1NameShort}    ${this.player1.getScore().toString().padStart(this.MAX_SCORE_SIZE, "0")}` }, this.p1POVButton, this.getShader(), this.TEXT_COLOR_RGBA);
        this.player2Label = new MyLabelButton(scene, () => { return `${this.player2NameShort}    ${this.player2.getScore().toString().padStart(this.MAX_SCORE_SIZE, "0")}` }, this.p2POVButton, this.getShader(), this.TEXT_COLOR_RGBA);

        this.currentLabel = new MyLabelButton(scene, () => {
            const gameState = this.gameModel.getGameState();
            if (gameState instanceof GameOverState) {
                return `  GAME OVER`;
            }
            return `    CURRENT`
        }, this.undoButton, this.getShader(), this.TEXT_COLOR_RGBA);

        this.currentPlayerLabel = new MyLabelButton(scene, () => {
            const gameState = this.gameModel.getGameState();
            if (gameState instanceof GameOverState) {
                const winner = gameState.getWinner();
                if (winner == null) {
                    return "IT'S A DRAW";
                } else {
                    const winnerName = winner.getName().substring(0, this.MAX_CHAR_NAME);
                    return `${winnerName}  WINS`;
                }
            } else {
                const currentPlayer = gameState.getCurrentPlayer();
                if (currentPlayer == null) {
                    return ' '.repeat(this.MAX_CHAR_NAME) + ' 00:00';
                }
                const currentPlayerName = currentPlayer.getName().substring(0, this.MAX_CHAR_NAME);
                return `${currentPlayerName} ${secondsToFormattedTime(gameState.getRemainingTime())}` 
            }
        }, this.playButton, this.getShader(), this.TEXT_COLOR_RGBA);

    }

    /**
     * Gets the dimensions of the score board.
     * @returns {Dimensions} - the dimensions of the score board
     */
    getDimensions() {
        return new Dimensions(3, 2, .4);
    }

    /**
     * Gets the labels of the score board.
     * @returns {MyButton[]} - the labels of the score board
     */
    getLabels() {
        return [
            this.totalTimeLabel,
            null,
            this.capturesLabel,
            this.player1Label,
            this.player2Label,
            null,
            this.currentLabel,
            this.currentPlayerLabel
        ];
    }
}
