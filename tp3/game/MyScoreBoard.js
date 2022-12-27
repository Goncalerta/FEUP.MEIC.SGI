import { CGFobject } from '../../lib/CGF.js';
import { MyFont } from './MyFont.js';
import { secondsToFormattedTime } from '../utils.js';
import { PlayerTurnState } from './GameState.js';
import { MyScoreBoardBox } from './MyScoreBoardBox.js';
import { MyButtonGroup } from './MyButtonGroup.js';

export class MyScoreBoard extends CGFobject {
    MAX_CHAR_NAME = 5;
    MAX_SCORE_SIZE = 2;
    BUTTONS_HEIGHT = 0.5;
    BUTTONS_WIDTH = 0.5;
    BUTTONS_DEPTH = 0.1;
    TEXT_COLOR_RGBA = [1, 1, 0.9, 1];
    DELTA_TEXT = 0.5;

    constructor(scene, gameModel, player1, player2, width=1, height=1, depth=1) {
        super(scene);

        this.gameModel = gameModel;
        this.player1 = player1;
        this.player2 = player2;

        this.width = width;
        this.height = height;
        this.depth = depth;

        this.font = new MyFont(scene, 0.01, this.TEXT_COLOR_RGBA);
        this.box = new MyScoreBoardBox(scene);
        
        this.buttonGroup = new MyButtonGroup(scene, this.BUTTONS_WIDTH, this.BUTTONS_HEIGHT, this.BUTTONS_DEPTH, this.TEXT_COLOR_RGBA);

        this.player1NameShort = player1.getName().substring(0, this.MAX_CHAR_NAME);
        this.player2NameShort = player2.getName().substring(0, this.MAX_CHAR_NAME);

        this.currentPlayerTimeLeftString = secondsToFormattedTime(0);
    }

    display() {
        const player1ScoreString = this.player1.getScore().toString().padStart(this.MAX_SCORE_SIZE, "0");
        const player2ScoreString = this.player2.getScore().toString().padStart(this.MAX_SCORE_SIZE, "0");

        const player1TotalTimeLeftString = secondsToFormattedTime(this.player1.getGameTimeLeft());
        const player2TotalTimeLeftString = secondsToFormattedTime(this.player2.getGameTimeLeft());

        const gameState = this.gameModel.getGameState();
        const currentPlayer = gameState.getCurrentPlayer();
        const currentPlayerName = currentPlayer == null ? "-".repeat(this.MAX_CHAR_NAME) : currentPlayer.getName().substring(0, this.MAX_CHAR_NAME);

        if (gameState instanceof PlayerTurnState) {
            this.currentPlayerTimeLeftString = secondsToFormattedTime(gameState.getRemainingTime());
        }
        
        // box
        this.scene.pushMatrix();
        this.scene.scale(this.width, this.height, this.depth);
        this.box.display();
        this.scene.popMatrix();

        // text
        this.scene.pushMatrix();
        this.scene.translate(-this.DELTA_TEXT, 0, this.depth / 2);
        this.scene.scale(2/this.width, 1/(2*this.height), 1);

        this.font.setShader();

        let translatedAmount = this.font.displayCenteredEqualLines(
            "   SCORE TIMES\n" +
            this.player1NameShort + " " + player1ScoreString + " " + player1TotalTimeLeftString + "\n" +
            this.player2NameShort + " " + player2ScoreString + " " + player2TotalTimeLeftString + "\n\n" +
            "CURRENT PLAYER\n" +
            "" + currentPlayerName + "    " + this.currentPlayerTimeLeftString
        ) - this.DELTA_TEXT - 0.2;

        this.font.resetShader();
        this.scene.popMatrix();

        // buttons
        this.scene.pushMatrix();
        this.scene.scale(2/this.width, 1, 1);
        this.scene.translate(translatedAmount, 0, this.depth / 2);
        this.scene.scale(this.width/2, 1, 1);

        this.buttonGroup.display();

        this.scene.popMatrix();
    }
}
