import { MyRectangle } from "../MyRectangle.js";

/**
 * MyRectangle class, representing a rectangle in XY plane.
 */
export class MyBoardTileGroup {
    NUM_TILES_SIDE = 8;

    /**
     * @constructor
     * @param scene Reference to MyScene object.
     * @param x1 x coordinate of first point.
     * @param x2 x coordinate of second point.
     * @param y1 y coordinate of first point.
     * @param y2 y coordinate of second point.
     */
    constructor(scene, model, tileSize) {
        this.scene = scene;
        this.model = model;
        this.tileSize = tileSize;
        
        this.tile = new MyRectangle(scene, -tileSize / 2, tileSize / 2, -tileSize / 2, tileSize / 2);
    }

    onClick(id) {
        const position = [id % 10, Math.floor(id / 10) % 10];
        this.model.state.selectTile(...position);
    }

    /**
     * Displays the checker
     */
    display() {
        for (let i = 0; i < this.NUM_TILES_SIDE; i++) {
            for (let j = 0; j < this.NUM_TILES_SIDE; j++) {
                const position = [(i-3.5)*this.tileSize, -(j-3.5)*this.tileSize];
                const height = 0.01;
                this.scene.registerForPick(300 + 10*j + i, this);

                this.scene.pushMatrix();
                this.scene.translate(position[0], height, position[1]);
                this.scene.rotate(-Math.PI / 2, 1, 0, 0);
                this.tile.display();
                this.scene.popMatrix();
            }
        }
    }
}
