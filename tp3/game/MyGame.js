import { GameModel } from './GameModel.js';
import { MyBoard } from './MyBoard.js';
import { MyCheckerGroup } from './MyCheckerGroup.js';
import { MyScoreBoard } from './MyScoreBoard.js';
import { Player } from './Player.js';

export class MyGame {
    TILE_SIZE = 0.5;

    constructor(scene) {
        this.scene = scene;

        this.player1 = new Player(1, "DIOGO");
        this.player2 = new Player(2, "PEDRO");

        this.model = new GameModel(0, this.player1, this.player2); // TODO start time (depends on main menu logic probably)
        this.checkers = new MyCheckerGroup(scene, this.model, this.TILE_SIZE);
        this.board = new MyBoard(scene, this.TILE_SIZE);

        // TODO just testing
        this.scoreBoard = new MyScoreBoard(scene, this.model, this.player1, this.player2);
    }

    display() {
        this.board.display();
        this.checkers.display();
        this.scoreBoard.display();
    }
}
