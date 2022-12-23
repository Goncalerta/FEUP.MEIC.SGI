import { CGFobject } from '../../lib/CGF.js';
import { MyFont } from './MyFont.js';
import { secondsToFormattedTime } from '../utils.js';

export class MyScoreBoard extends CGFobject {
    MAX_CHAR_NAME = 5;
    MAX_SCORE_SIZE = 2;

    constructor(scene, gameModel, player1, player2) {
        super(scene);

        this.gameModel = gameModel;
        this.player1 = player1;
        this.player2 = player2;

        this.font = new MyFont(scene, 0.5, 0.5, 0.01);

        this.player1NameShort = player1.getName().substring(0, this.MAX_CHAR_NAME);
        this.player2NameShort = player2.getName().substring(0, this.MAX_CHAR_NAME);
    }

    display() {
        const player1ScoreString = this.player1.getScore().toString().padStart(this.MAX_SCORE_SIZE, "0");
        const player2ScoreString = this.player2.getScore().toString().padStart(this.MAX_SCORE_SIZE, "0");

        const player1TotalTimeLeftString = secondsToFormattedTime(this.player1.getGameTimeLeft());
        const player2TotalTimeLeftString = secondsToFormattedTime(this.player2.getGameTimeLeft());

        // TODO get values from game model vv
        const currentPlayerName = this.player1NameShort;
        const currentPlayerTimeLeftString = secondsToFormattedTime(0);
        // ^^

        this.scene.pushMatrix();
        this.font.setShader();
    
        this.scene.translate(-2.5, 2.25, 2);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.scene.scale(0.6, 0.6, 1);

        this.font.display(
            "   SCORE TIMES\n" +
            this.player1NameShort + " " + player1ScoreString + " " + player1TotalTimeLeftString + "\n" +
            this.player2NameShort + " " + player2ScoreString + " " + player2TotalTimeLeftString + "\n\n\n" +
            "CURRENT PLAYER\n" +
            "" + currentPlayerName + "    " + currentPlayerTimeLeftString
        );

        this.font.resetShader();
        this.scene.popMatrix();
    }

}
