import { CGFtexture } from '../../lib/CGF.js';
import { MyPatch } from '../MyPatch.js';
import { getAppearance } from '../utils.js';

/**
 * MyBoardTop class, representing the top of the board with its texture.
 */
export class MyBoardTop {
    TEXTURE_PATH = "scenes/images/game/board.png";
    MATERIAL = {
        shininess: 10,
        emission: [0.3, 0.24, 0.24, 1.0],
        ambient: [0.7, 0.6, 0.6, 1.0],
        diffuse: [0.9, 0.7, 0.7, 1.0],
        specular: [0.8, 0.6, 0.6, 1.0],
    };

    /**
     * @constructor
     * @param scene Reference to MyScene object.
     * @param realHalfSize Half size of the board
     */
     constructor(scene, realHalfSize) {
        this.scene = scene;
        this.realHalfSize = realHalfSize;
        this.texture = new CGFtexture(scene, this.TEXTURE_PATH);
        this.material = getAppearance(scene, this.MATERIAL, this.texture);

        this.geometry = new MyPatch(scene, 1, 100, 1, 100, [
            [
                [-realHalfSize, 0, realHalfSize, 1],
                [-realHalfSize, 0, -realHalfSize, 1],
            ],
            [
                [realHalfSize, 0, realHalfSize, 1],
                [realHalfSize, 0, -realHalfSize, 1],
            ],
        ]);
    }

    /**
     * Displays the board top.
     */
    display() {
        this.material.apply();
        this.scene.pushMatrix();
        this.geometry.display();
        this.scene.popMatrix();
    }
}
