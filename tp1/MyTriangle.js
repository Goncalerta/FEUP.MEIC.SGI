import { CGFobject } from '../lib/CGF.js';
import { applyLengthsToTextureCoords, calculateNorm, crossProduct, normalizeVector, subtractVectors } from './utils.js';

export class MyTriangle extends CGFobject {
    /**
     * @constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {list} p1 - Point 1
     * @param {list} p2 - Point 2
     * @param {list} p3 - Point 3
     */
    constructor(scene, p1, p2, p3) {
        super(scene);
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;

        this.initBuffers();
    }
    
    initBuffers() {
        this.vertices = [
            ...this.p1,
            ...this.p2,
            ...this.p3
        ];

        this.indices = [
            0, 1, 2
        ];

        const v1 = subtractVectors(this.p2, this.p1);
        const v2 = subtractVectors(this.p3, this.p1);
        const normal = normalizeVector(crossProduct(v1, v2));

        this.normals = [
            ...normal,
            ...normal,
            ...normal
        ];

        // texCoords
        const va = subtractVectors(this.p1, this.p2);
        const vb = subtractVectors(this.p2, this.p3);
        const vc = subtractVectors(this.p3, this.p1);
        const a = calculateNorm(va);
        const b = calculateNorm(vb);
        const c = calculateNorm(vc);

        const cosAlpha = (a**2 - b**2 + c**2) / (2 * a * c);
        const sinAlpha = Math.sqrt(1 - cosAlpha**2);

        // No need to divide by this.length_s and length_t since they start as 1.0
        this.baseTexCoords = [
            0, 0,
            a, 0,
            (c * cosAlpha), (c * sinAlpha)
        ];
        this.texCoords = this.baseTexCoords;

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateTexCoords(length_s, length_t) {
        this.texCoords = applyLengthsToTextureCoords(this.baseTexCoords, length_s, length_t);
        this.updateTexCoordsGLBuffers();
    }
}
