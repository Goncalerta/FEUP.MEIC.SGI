import { CGFobject } from "../lib/CGF.js";
import { applyLengthsToTextureCoords } from "./utils.js";

/**
 * MyRectangle class, representing a rectangle in XY plane.
 */
export class MyRectangle extends CGFobject {
    /**
     * @constructor
     * @param scene Reference to MyScene object.
     * @param x1 x coordinate of first point.
     * @param x2 x coordinate of second point.
     * @param y1 y coordinate of first point.
     * @param y2 y coordinate of second point.
     */
    constructor(scene, x1, x2, y1, y2) {
        super(scene);
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;

        this.initBuffers();
    }

    /**
     * Initializes the rectangle buffers
     */
    initBuffers() {
        this.vertices = [
            this.x1, this.y1, 0,
            this.x2, this.y1, 0,
            this.x1, this.y2, 0,
            this.x2, this.y2, 0,
        ];

        // Counter-clockwise reference of vertices
        this.indices = [
            0, 1, 2,
            1, 3, 2
        ];

        // Facing Z positive
        this.normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ];

        // No need to divide by this.length_s and length_t since they start as 1.0
        const dx = Math.abs(this.x1-this.x2);
        const dy = Math.abs(this.y1-this.y2);
        this.texCoords = [
            0, dy,
            dx, dy,
            0, 0,
            dx, 0
        ];
        this.baseTexCoords = this.texCoords;
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * Updates texture coordinates based on length_s and length_t
     * @param length_s
     * @param length_t
     */
    updateTexCoords(length_s, length_t) {
        this.texCoords = applyLengthsToTextureCoords(
            this.baseTexCoords,
            length_s,
            length_t
        );
        this.updateTexCoordsGLBuffers();
    }
}
