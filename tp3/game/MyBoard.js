import { MyBoardTop } from "./MyBoardTop.js";
import { MyBoardTileGroup } from "./MyBoardTileGroup.js";
import { MyBoardHintGroup } from "./MyBoardHintGroup.js";

/**
 * MyBoard class, representing the game board.
 */
export class MyBoard {
    NUM_TILES_SIDE = 8;
    EDGE_SIZE = 0.28;

    /**
     * @constructor
     * @param scene Reference to MyScene object.
     * @param model Reference to MyGameModel object.
     * @param tileSize Size of the tiles
     */
    constructor(scene, model, tileSize) {
        this.scene = scene;
        this.tileSize = tileSize;
        this.realHalfSize = (this.EDGE_SIZE + this.NUM_TILES_SIDE / 2) * tileSize;
        this.boardTop = new MyBoardTop(scene, this.realHalfSize);
        this.tiles = new MyBoardTileGroup(scene, model, tileSize);
        this.moveHints = new MyBoardHintGroup(scene, model, tileSize);
    }

    /**
     * Displays the board.
     * @param {Boolean} pickMode Whether the board is being displayed in pick mode
     */
    display(pickMode) {
        this.boardTop.display();

        if (pickMode) {
            this.tiles.display();
        } else {
            this.moveHints.display();
        }
    }
}
