import { CGFobject } from '../../../lib/CGF.js';
import { MyFont } from '../MyFont.js';
import { secondsToFormattedTime } from '../../utils.js';
import { MyScoreBoardBox } from './MyScoreBoardBox.js';
import { MyScoreBoardButtons } from './MyScoreBoardButtons.js';

export class MyScoreBoard extends CGFobject {
    MAX_CHAR_NAME = 5;
    MAX_SCORE_SIZE = 2;
    TEXT_COLOR_RGBA = [1, 1, 0.9, 1];
    DELTA_TEXT = 0.1;

    constructor(scene, gameModel, cameras, player1, player2, width=1, height=1, depth=1) {
        super(scene);

        this.gameModel = gameModel;
        this.player1 = player1;
        this.player2 = player2;

        this.width = width;
        this.height = height;
        this.depth = depth;

        this.font = new MyFont(scene, 0.2, this.TEXT_COLOR_RGBA);
        this.box = new MyScoreBoardBox(scene);
        
        this.buttonGroup = new MyScoreBoardButtons(scene, gameModel, cameras, this.TEXT_COLOR_RGBA);

        this.player1NameShort = player1.getName().substring(0, this.MAX_CHAR_NAME);
        this.player2NameShort = player2.getName().substring(0, this.MAX_CHAR_NAME);
    }

    display() {
        const player1ScoreString = this.player1.getScore().toString().padStart(this.MAX_SCORE_SIZE, "0");
        const player2ScoreString = this.player2.getScore().toString().padStart(this.MAX_SCORE_SIZE, "0");

        const totalTime = secondsToFormattedTime(this.gameModel.getGameTime()); // TODO: get total time from model (am i doing it right?)

        const gameState = this.gameModel.getGameState();
        const currentPlayer = gameState.getCurrentPlayer();
        const currentPlayerName = currentPlayer == null ? "-".repeat(this.MAX_CHAR_NAME) : currentPlayer.getName().substring(0, this.MAX_CHAR_NAME);

        const currentPlayerTimeLeftString = secondsToFormattedTime(gameState.getRemainingTime());

        let stringToDisplay = 
            "TIME  " + totalTime + "\n\n" +
            "      SCORE\n" +
            this.player1NameShort + "    " + player1ScoreString + "\n" +
            this.player2NameShort + "    " + player2ScoreString + "\n\n" +
            "    CURRENT\n" +
            currentPlayerName + " " + currentPlayerTimeLeftString;
        
        // box
        this.scene.pushMatrix();
        this.scene.scale(this.width, this.height, this.depth);
        this.box.display();
        this.scene.popMatrix();

        // text
        this.scene.pushMatrix();
        this.scene.translate(-this.DELTA_TEXT, 0, this.depth / 2);

        this.font.writeCenteredEqualLines(stringToDisplay);    

        this.scene.popMatrix();

        // buttons
        this.scene.pushMatrix();
        this.scene.translate(this.font.getTransAmountCenteredEqualLines(stringToDisplay), 0.475, this.depth / 2);
        this.scene.scale(0.175, 0.175, 0.36)

        this.buttonGroup.display();

        this.scene.popMatrix();
    }
}
