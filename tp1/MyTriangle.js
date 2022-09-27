import { CGFobject } from '../lib/CGF.js';
import { crossProduct, normalizeVector, subtractVectors } from './utils.js';

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

		// TODO [texCoords] this.texCoords

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}
}
