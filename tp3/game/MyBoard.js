import { MyBoardTop } from "./MyBoardTop.js";

/**
 * MyRectangle class, representing a rectangle in XY plane.
 */
export class MyBoard {
    NUM_TILES_SIDE = 8;
    EDGE_SIZE = 0.25; // TODO this might not be exactly correct

    /**
     * @constructor
     * @param scene Reference to MyScene object.
     * @param x1 x coordinate of first point.
     * @param x2 x coordinate of second point.
     * @param y1 y coordinate of first point.
     * @param y2 y coordinate of second point.
     */
    constructor(scene, tileSize) {
        this.scene = scene;
        this.tileSize = tileSize;
        this.realHalfSize = (this.EDGE_SIZE + this.NUM_TILES_SIDE / 2) * tileSize;
        this.boardTop = new MyBoardTop(scene, this.realHalfSize);
    }

    squareClickHandler(row, column) {
        // TODO
    }

    display() {
        this.boardTop.display();
    }
}
