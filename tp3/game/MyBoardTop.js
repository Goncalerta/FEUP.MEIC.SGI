import { CGFobject, CGFtexture } from '../../lib/CGF.js';
import { MyPatch } from '../MyPatch.js';
import { getAppearance } from '../utils.js';

/**
 * MyRectangle class, representing a rectangle in XY plane.
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
     * @param x1 x coordinate of first point.
     * @param x2 x coordinate of second point.
     * @param y1 y coordinate of first point.
     * @param y2 y coordinate of second point.
     */
     constructor(scene, realHalfSize) {
        this.scene = scene;
        this.realHalfSize = realHalfSize;
        this.texture = new CGFtexture(scene, this.TEXTURE_PATH);
        this.material = getAppearance(scene, this.MATERIAL, this.texture);

        const delta = 0.01;
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

    display() {
        this.material.apply();
        this.scene.pushMatrix();
        // this.scene.translate(0, 0, -0.01)
        this.geometry.display();
        this.scene.popMatrix();
    }
}
