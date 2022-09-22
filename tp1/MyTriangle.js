import { CGFobject } from '../lib/CGF.js';
/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x1 - x coordinate of first point
 * @param y1 - y coordinate of first point
 * @param z1 - z coordinate of first point
 * @param x2 - x coordinate of second point
 * @param y2 - y coordinate of second point
 * @param z2 - z coordinate of second point
 * @param x3 - x coordinate of third point
 * @param y3 - y coordinate of third point
 * @param z3 - z coordinate of third point
 * 
 */
export class MyTriangle extends CGFobject {
	constructor(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
		super(scene);
		this.x1 = x1;
		this.x2 = x2;
		this.x3 = x3;
		this.y1 = y1;
		this.y2 = y2;
		this.y3 = y3;
		this.z1 = z1;
		this.z2 = z2;
		this.z3 = z3;

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [
			this.x1, this.y1, this.z1,	//0
			this.x2, this.y2, this.z2,	//1
			this.x3, this.y3, this.z3	//2
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2
		];

		
		// Normals
		const v1 = [this.x2 - this.x1, this.y2 - this.y1, this.z2 - this.z1];
		const v2 = [this.x3 - this.x1, this.y3 - this.y1, this.z3 - this.z1];
		const normal = [
			v1[1] * v2[2] - v1[2] * v2[1],
			v1[2] * v2[0] - v1[0] * v2[2],
			v1[0] * v2[1] - v1[1] * v2[0]
		];
		this.normals = [
			normal[0], normal[1], normal[2],
			normal[0], normal[1], normal[2],
			normal[0], normal[1], normal[2]
		]

		// TODO texCoords
		// this.texCoords = [
		// 	0, 1,
		// 	1, 1,
		// 	0, 0,
		// 	1, 0
		// ]
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}
}

