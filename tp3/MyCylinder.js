import {CGFobject} from '../lib/CGF.js';
import {normalizeVector} from './utils.js';

/**
 * MyCylinder class, representing a cylinder, cone or part of a cone.
 */
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
    constructor(scene, baseRadius, topRadius, height, slices, stacks, inside = false) {
        super(scene);
        this.baseRadius = baseRadius;
        this.topRadius = topRadius;
        this.height = height;
        this.slices = Math.ceil(slices);
        this.stacks = Math.ceil(stacks);
        this.inside = inside;
        this.initBuffers();
    }

    /**
     * Initializes the cylinder buffers
     */
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        // angle of each slice
        const alpha = (Math.PI * 2) / this.slices;
        // height of each stack
        const stackHeight = this.height / this.stacks;

        // length of the side of the cylinder (==height if baseRadius==topRadius)
        const hypo = Math.sqrt(
            (this.baseRadius - this.topRadius) ** 2 + this.height ** 2
        );
        // sin and cos of the angle at which the sides of the cylinder are leaning
        const sinLeaningAngle = (this.baseRadius - this.topRadius) / hypo;
        const cosLeaningAngle = this.height / hypo;

        // iterating along the cylinder height
        for (let i = 0; i <= this.stacks; i++) {
            // iterating around the cylinder
            for (let j = 0; j <= this.slices; j++) {
                // cylinder radius at current height
                const currentRadius =
                    this.baseRadius +
                    i * ((this.topRadius - this.baseRadius) / this.stacks);
                const currentAngle = (j % this.slices) * alpha;
                const cosCurrentAngle = Math.cos(currentAngle);
                const sinCurrentAngle = Math.sin(currentAngle);

                // <x,y,z> = <cos(a)*R, sin(a)*R, h>
                this.vertices.push(
                    cosCurrentAngle * currentRadius,
                    sinCurrentAngle * currentRadius,
                    i * stackHeight
                );

                // the current normal is a vector at the origin leaned
                // accordingly to the cylinder leaning, and rotated
                // to the current angle around it
                const normal = normalizeVector([
                    cosLeaningAngle * cosCurrentAngle,
                    cosLeaningAngle * sinCurrentAngle,
                    sinLeaningAngle
                ]);
                if (this.inside) {
                    normal[0] = -normal[0];
                    normal[1] = -normal[1];
                    normal[2] = -normal[2];
                }
                this.normals.push(...normal);

                this.texCoords.push(j / this.slices, 1 - i / this.stacks);
            }
        }

        // make triangles with the vertices from consecutive stacks
        for (let i = 0; i < this.stacks; i++) {
            for (let j = 0; j < this.slices; j++) {
                // index of a vertex in the current stack
                const indexVertex = i * (this.slices + 1) + j;
                // index of the vertex on top of the vertex in the current stack
                const indexVertexTop = indexVertex + this.slices + 1;

                if (this.inside) {
                    this.indices.push(
                        indexVertex,
                        indexVertexTop + 1,
                        indexVertex + 1
                    );
                    this.indices.push(
                        indexVertex,
                        indexVertexTop,
                        indexVertexTop + 1
                    );
                } else {
                    this.indices.push(
                        indexVertex,
                        indexVertex + 1,
                        indexVertexTop + 1
                    );
                    this.indices.push(
                        indexVertex,
                        indexVertexTop + 1,
                        indexVertexTop
                    );
                }
            }
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
