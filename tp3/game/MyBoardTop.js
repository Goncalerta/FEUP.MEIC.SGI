import {CGFappearance, CGFobject, CGFtexture} from '../../lib/CGF.js';
import { getAppearance } from '../utils.js';

/**
 * MyRectangle class, representing a rectangle in XY plane.
 */
export class MyBoardTop extends CGFobject {
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
        super(scene);

        this.realHalfSize = realHalfSize;
        this.texture = new CGFtexture(scene, this.TEXTURE_PATH);
        this.material = getAppearance(scene, this.MATERIAL, this.texture);

        this.initBuffers();
    }

    /**
     * Initializes the rectangle buffers
     */
    initBuffers() {
        // TODO use NURBS for example, so that lights work better
        this.vertices = [
            this.realHalfSize, 0, -this.realHalfSize,
            -this.realHalfSize, 0, -this.realHalfSize,
            this.realHalfSize, 0, this.realHalfSize,
            -this.realHalfSize, 0, this.realHalfSize,
        ];

        // Counter-clockwise reference of vertices
        this.indices = [
            0, 1, 2,
            1, 3, 2
        ];

        // Facing Y positive
        this.normals = [
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0
        ];

        this.texCoords = [
            0, 1,
            1, 1,
            0, 0,
            1, 0
        ];
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    display() {
        this.material.apply();
        super.display();
    }
}
