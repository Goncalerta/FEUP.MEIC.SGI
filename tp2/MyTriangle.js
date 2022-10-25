import {CGFobject} from '../lib/CGF.js';
import {
    applyLengthsToTextureCoords,
    calculateNorm,
    crossProduct,
    normalizeVector,
    subtractVectors,
} from './utils.js';

/**
 * MyTriangle class, representing a triangle.
 */
export class MyTriangle extends CGFobject {
    /**
     * @constructor
     * @param {CGFscene} scene Reference to MyScene object.
     * @param {list} p1 Point 1.
     * @param {list} p2 Point 2.
     * @param {list} p3 Point 3.
     */
    constructor(scene, p1, p2, p3) {
        super(scene);
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;

        this.initBuffers();
    }

    /**
     * Initializes the triangle buffers
     */
    initBuffers() {
        this.vertices = [...this.p1, ...this.p2, ...this.p3];

        this.indices = [0, 1, 2];

        // The normal can be defined with the cross product of two non-collinear vectors in the plane of this triangle
        const v1 = subtractVectors(this.p2, this.p1);
        const v2 = subtractVectors(this.p3, this.p1);
        const normal = normalizeVector(crossProduct(v1, v2));
        this.normals = [...normal, ...normal, ...normal];

        // texCoords
        // first calculate the lenght of each side of the triangle (a, b, c)
        const va = subtractVectors(this.p1, this.p2);
        const vb = subtractVectors(this.p2, this.p3);
        const vc = subtractVectors(this.p3, this.p1);
        const a = calculateNorm(va);
        const b = calculateNorm(vb);
        const c = calculateNorm(vc);

        // then calculate sin and cos of alpha, to use in tex coords
        const cosAlpha = (a ** 2 - b ** 2 + c ** 2) / (2 * a * c);
        const sinAlpha = Math.sqrt(1 - cosAlpha ** 2);

        // No need to divide by this.length_s and length_t since they start as 1.0
        this.baseTexCoords = [
            0, 0,
            a, 0,
            c * cosAlpha, c * sinAlpha
        ];
        this.texCoords = this.baseTexCoords;

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * Updates texture coordinates based on length_s and length_t
     * @param lengthS
     * @param lengthT
     */
    updateTexCoords(lengthS, lengthT) {
        this.texCoords = applyLengthsToTextureCoords(
            this.baseTexCoords,
            lengthS,
            lengthT
        );
        this.updateTexCoordsGLBuffers();
    }
}
