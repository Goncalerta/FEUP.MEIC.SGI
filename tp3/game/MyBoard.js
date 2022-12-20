import { MyBoardTop } from "./MyBoardTop.js";
import { MyChecker } from "./MyChecker.js";

/**
 * MyRectangle class, representing a rectangle in XY plane.
 */
export class MyBoard {
    NUM_TILES_SIDE = 8;
    EDGE_SIZE = 0.25; // TODO this might not be exactly correct
    CHECKER_TILE_RATIO = 0.4;
    CHECKER_HEIGHT = 0.1;

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

        this.checker = new MyChecker(scene, tileSize * this.CHECKER_TILE_RATIO, this.CHECKER_HEIGHT, 1); 
        // TODO different checkers with different pickingIds for different places
        // TODO make drawing more efficient (we should reuse appearances and textures whenever possible) 
    }

    squareClickHandler(row, column) {
        
    }

    display() {
        this.boardTop.display();
        
        // TODO: the positions might be transferred to a "model" class so that they are separated by players...
        // just a "proof of concept"
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                this.scene.pushMatrix();
                if (i % 2 == 0) {
                    this.scene.translate(this.tileSize, 0, 0);
                }

                this.scene.pushMatrix();
                this.scene.translate(-this.tileSize/2 - 3*this.tileSize + 2*j*this.tileSize, 0, -this.tileSize/2 - 3*this.tileSize + i*this.tileSize);
                this.checker.display();
                this.scene.popMatrix();

                this.scene.popMatrix();
            }
        }
    }
}
