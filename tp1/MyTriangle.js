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

		this.length_s = 1.0;
		this.length_t = 1.0;

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

		this.texCoords = [
			0, 0,
			a / this.length_s, 0,
			(c * cosAlpha) / this.length_s, (c * sinAlpha) / this.length_t
		];

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	updateLengthST(new_length_s, new_length_t) {
		this.texCoords = applyLengthsToTextureCoords(this.texCoords, this.length_s, this.length_t, new_length_s, new_length_t);

		this.length_s = new_length_s;
		this.length_t = new_length_t;

		this.updateTexCoordsGLBuffers();
	}
}
