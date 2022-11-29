import {CGFobject} from '../lib/CGF.js';

// TODO confirm if correct on the scene display
/**
 * MyCircle class, representing a circle.
 */
export class MyCircle extends CGFobject {
    /**
     * @constructor
     * @param {CGFscene} scene Reference to MyScene object.
     * @param {list} radius Radius.
     * @param {list} center Center.
     * @param {list} slices Slices.
     */
    constructor(scene, radius, center, slices) {
        super(scene);
        this.radius = radius;
        this.center = center;
        this.slices = slices;

        this.initBuffers();
    }

    /**
     * Initializes the triangle buffers
     */
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        // angle of each slice
        const alpha = (Math.PI * 2) / this.slices;
        
        // iterating around the circle
        for (let j = 0; j <= this.slices; j++) {
            const currentAngle = (j % this.slices) * alpha;
            const cosCurrentAngle = Math.cos(currentAngle);
            const sinCurrentAngle = Math.sin(currentAngle);

            this.vertices.push(
                this.center[0] + this.radius * cosCurrentAngle,
                this.center[1] + this.radius * sinCurrentAngle,
                this.center[2]
            );
            this.normals.push(0, 0, 1);
            this.texCoords.push(cosCurrentAngle, sinCurrentAngle);
        }

        // iterating around the circle
        for (let j = 0; j < this.slices; j++) {
            this.indices.push(j, j + 1, this.slices + 1);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * Updates texture coordinates based on length_s and length_t
     * @param lengthS
     * @param lengthT
     */
     updateTexCoords(lengthS, lengthT) {
        // We don't need to update tex coords in quadrics
    }
}
