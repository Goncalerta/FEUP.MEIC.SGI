import {CGFobject} from '../lib/CGF.js';
import { normalizeVector } from './utils.js';

export class MyCylinder extends CGFobject {
    /**
     * @method constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {float} baseRadius - Radius of the cylinder's base
     * @param {float} topRadius - Radius of the cylinder's top
     * @param {float} height - Height of the cylinder (along Z axis)
     * @param {integer} slices - Number of divisions around the Z axis (circumference)
     * @param {integer} stacks - Number of divisions along the Z axis
     */
	constructor(scene, baseRadius, topRadius, height, slices, stacks) {
        super(scene);
        this.baseRadius = baseRadius;
        this.topRadius = topRadius;
        this.height = height;
        this.slices = Math.ceil(slices);
        this.stacks = Math.ceil(stacks);
        this.initBuffers();
	}

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const alpha = Math.PI*2 / this.slices;
        const stackHeight = this.height/this.stacks;

        const hypo = Math.sqrt((this.baseRadius - this.topRadius)**2 + this.height**2);
        const sinLeaningAngle = (this.baseRadius - this.topRadius) / hypo;
        const cosLeaningAngle = this.height / hypo;

        // TODO [confirm] is this one right?
        // const sinLeaningAngle = (this.baseRadius - this.topRadius) / this.height;
        // const cosLeaningAngle = Math.sqrt(1 - sinLeaningAngle ** 2);

        for (let i = 0; i <= this.stacks; i++) {
            for (let j = 0; j <= this.slices; j++) {
                const currentRadius = this.baseRadius + i * ((this.topRadius - this.baseRadius)/this.stacks)
                const currentAngle = (j % this.slices) * alpha;

                this.vertices.push(
                    Math.cos(currentAngle) * currentRadius,
                    Math.sin(currentAngle) * currentRadius,
                    i*stackHeight
                );
                
                // TODO [confirm] if this is correct
                this.normals.push(...normalizeVector([
                    Math.cos(currentAngle),
                    Math.sin(currentAngle) * cosLeaningAngle,
                    Math.sin(currentAngle) * sinLeaningAngle
                ]));

                //this.texCoords.push(j/this.slices, i/this.stacks); // TODO [texCoords] check texture
            }
        }

        for (let i = 0; i < this.stacks; i++) {
            for (let j = 0; j < this.slices; j++) {
                const indexVertex = i * (this.slices + 1) + j;
                const indexVertexTop = indexVertex + this.slices + 1;

                this.indices.push(indexVertex, indexVertex + 1, indexVertexTop + 1)
                this.indices.push(indexVertex, indexVertexTop + 1, indexVertexTop)
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
    }
}
