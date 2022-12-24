import { CGFobject } from '../../lib/CGF.js';
import { MyFont } from './MyFont.js';
import { secondsToFormattedTime } from '../utils.js';
import { PlayerTurnState } from './GameState.js';
import { MyScoreBoardBox } from './MyScoreBoardBox.js';

export class MyScoreBoard extends CGFobject {
    MAX_CHAR_NAME = 5;
    MAX_SCORE_SIZE = 2;

    constructor(scene, gameModel, player1, player2, width=1, height=1, depth=1) {
        super(scene);

        this.gameModel = gameModel;
        this.player1 = player1;
        this.player2 = player2;

        this.width = width;
        this.height = height;
        this.depth = depth;

        const fontColorRGBa = [1, 1, 0.8, 1];
        this.font = new MyFont(scene, 0.01, fontColorRGBa);
        this.box = new MyScoreBoardBox(scene);

        this.player1NameShort = player1.getName().substring(0, this.MAX_CHAR_NAME);
        this.player2NameShort = player2.getName().substring(0, this.MAX_CHAR_NAME);
    }

    display() {
        const player1ScoreString = this.player1.getScore().toString().padStart(this.MAX_SCORE_SIZE, "0");
        const player2ScoreString = this.player2.getScore().toString().padStart(this.MAX_SCORE_SIZE, "0");

        const player1TotalTimeLeftString = secondsToFormattedTime(this.player1.getGameTimeLeft());
        const player2TotalTimeLeftString = secondsToFormattedTime(this.player2.getGameTimeLeft());

        const gameState = this.gameModel.getGameState();
        const currentPlayer = gameState.getCurrentPlayer();
        const currentPlayerName = currentPlayer == null ? "-".repeat(this.MAX_CHAR_NAME) : currentPlayer.getName().substring(0, this.MAX_CHAR_NAME);

        let currentPlayerTimeLeftString = secondsToFormattedTime(0);
        if (gameState instanceof PlayerTurnState) {
            currentPlayerTimeLeftString = secondsToFormattedTime(gameState.getRemainingTime());
        }
        
        this.scene.pushMatrix();
        this.scene.scale(this.width, this.height, this.depth);
        this.box.display();
        this.scene.translate(0, 0, 0.5);
        this.scene.scale(0.065, 0.15, 1);

        this.font.setShader();

        this.font.displayCenteredEqualLines(
            "   SCORE TIMES\n" +
            this.player1NameShort + " " + player1ScoreString + " " + player1TotalTimeLeftString + "\n" +
            this.player2NameShort + " " + player2ScoreString + " " + player2TotalTimeLeftString + "\n\n" +
            "CURRENT PLAYER\n" +
            "" + currentPlayerName + "    " + currentPlayerTimeLeftString
        );

        this.font.resetShader();
        this.scene.popMatrix();
    }

}
