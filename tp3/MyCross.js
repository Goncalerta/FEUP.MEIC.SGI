import {CGFobject} from '../lib/CGF.js';

/**
 * MyCross class, representing a cross.
 */
export class MyCross extends CGFobject {
    /**
     * @constructor
     * @param scene Reference to MyScene object.
     * @param stroke Stroke of the cross
     */
    constructor(scene, stroke) {
        super(scene);
        this.hstroke = stroke/2;

        this.initBuffers();
    }

    /**
     * Initializes the cross buffers
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
