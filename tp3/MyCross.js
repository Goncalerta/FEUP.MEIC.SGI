import {CGFobject} from '../lib/CGF.js';

/**
 * MyRectangle class, representing a rectangle in XY plane.
 */
export class MyCross extends CGFobject {
    /**
     * @constructor
     * @param scene Reference to MyScene object.
     * @param x1 x coordinate of first point.
     * @param x2 x coordinate of second point.
     * @param y1 y coordinate of first point.
     * @param y2 y coordinate of second point.
     */
    constructor(scene, stroke) {
        super(scene);
        this.hstroke = stroke/2;

        this.initBuffers();
    }

    /**
     * Initializes the rectangle buffers
     */
    initBuffers() {
        this.vertices = [
            -this.hstroke, 0, this.hstroke,
            -this.hstroke, 0, 0.5,
            this.hstroke, 0, 0.5,
            this.hstroke, 0, this.hstroke,
            0.5, 0, this.hstroke,
            0.5, 0, -this.hstroke,
            this.hstroke, 0, -this.hstroke,
            this.hstroke, 0, -0.5,
            -this.hstroke, 0, -0.5,
            -this.hstroke, 0, -this.hstroke,
            -0.5, 0, -this.hstroke,
            -0.5, 0, this.hstroke
        ];

        // Counter-clockwise reference of vertices
        this.indices = [
            0, 1, 2,
            0, 2, 3,
            3, 4, 5,
            3, 5, 6,
            6, 7, 8,
            6, 8, 9,
            9, 10, 11,
            9, 11, 0,
            0, 3, 6,
            0, 6, 9,
        ];

        // Facing Z positive
        this.normals = [
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
