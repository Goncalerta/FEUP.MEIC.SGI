import { MyRectangle } from "../MyRectangle.js";

/**
 * MyBoardTileGroup class, representing the board tiles.
 */
export class MyBoardTileGroup {
    NUM_TILES_SIDE = 8;

    /**
     * @constructor
     * @param scene Reference to MyScene object.
     * @param model Reference to MyGameModel object.
     * @param tileSize Size of the tiles
     */
    constructor(scene, model, tileSize) {
        this.scene = scene;
        this.model = model;
        this.tileSize = tileSize;
        
        this.tile = new MyRectangle(scene, -tileSize / 2, tileSize / 2, -tileSize / 2, tileSize / 2);
    }

    /**
     * Handles the click on the board
     * @param {Number} id ID of the clicked tile
     */
    onClick(id) {
        const position = [id % 10, Math.floor(id / 10) % 10];
        this.model.state.selectTile(...position);
    }

    /**
     * Displays the board tiles.
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
