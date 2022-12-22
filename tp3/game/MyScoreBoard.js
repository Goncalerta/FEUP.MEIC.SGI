import { CGFobject } from '../../lib/CGF.js';
import { MyFont } from './MyFont.js';

export class MyScoreBoard extends CGFobject {
    MAX_CHAR_NAME = 5;
    MAX_SCORE_SIZE = 2;

    constructor(scene, player1Name, player2Name) {
        super(scene);

        this.font = new MyFont(scene, 0.5, 0.5, 0.01);

        this.player1Name = player1Name;
        this.player2Name = player2Name;
        this.player1NameShort = player1Name.substring(0, this.MAX_CHAR_NAME);
        this.player2NameShort = player2Name.substring(0, this.MAX_CHAR_NAME);

        this.player1Score = 0;
        this.player2Score = 0;
        this.player1ScoreString = this.player1Score.toString().padStart(this.MAX_SCORE_SIZE, "0");
        this.player2ScoreString = this.player2Score.toString().padStart(this.MAX_SCORE_SIZE, "0");

        this.player1Height = 2;
        this.player2Height = 1;
    }
    
    updateScore(playerName, score) {
        if (playerName === this.player1Name) {
            this.player1Score = score;
            this.player1ScoreString = this.player1Score.toString().padStart(this.MAX_SCORE_SIZE, "0");
        } else if (playerName === this.player2Name) {
            this.player2Score = score;
            this.player2ScoreString = this.player2Score.toString().padStart(this.MAX_SCORE_SIZE, "0");
        } else {
            console.log("Error: player name not found");
        }
    }

    display() {
        this.scene.pushMatrix();
        this.font.setShader();

        this.scene.translate(-2.5, 0, 0);
        this.scene.rotate(Math.PI/2, 0, 1, 0);

        this.scene.pushMatrix();
            this.scene.translate(-1.5, this.player1Height, 0);
            this.font.display(this.player1NameShort);
            this.scene.translate(3, 0, 0);
            this.font.display(this.player1ScoreString);
        this.scene.popMatrix();

        this.scene.pushMatrix();
            this.scene.translate(-1.5, this.player2Height, 0);
            this.font.display(this.player2NameShort);
            this.scene.translate(3, 0, 0);
            this.font.display(this.player2ScoreString);
        this.scene.popMatrix();

        this.font.resetShader();
        this.scene.popMatrix();
    }

}
