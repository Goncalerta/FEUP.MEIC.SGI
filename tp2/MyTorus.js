import {CGFobject} from '../lib/CGF.js';
import {normalizeVector} from './utils.js';

/**
 * MyTorus class, representing a torus.
 */
export class MyTorus extends CGFobject {
    /**
     * @method constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {float} innerRadius - Inner radius of the torus
     * @param {float} outerRadius - Outer radius of the torus
     * @param {integer} slices - Number of divisions around the inner radius
     * @param {integer} loops - Number of divisions along the the outer radius
     */
    constructor(scene, innerRadius, outerRadius, slices, loops) {
        super(scene);

        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.slices = Math.ceil(slices);
        this.loops = Math.ceil(loops);
        this.initBuffers();
    }

    /**
     * Initializes the torus buffers
     */
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        // angle of each slice
        const stepInner = (Math.PI * 2) / this.slices;
        // angle of each loop
        const stepOuter = (Math.PI * 2) / this.loops;

        // iterating around the outer radius
        for (let i = 0; i <= this.loops; i++) {
            // current outer angle
            const outerAngle = (i % this.loops) * stepOuter;
            const cosOuterAngle = Math.cos(outerAngle);
            const sinOuterAngle = Math.sin(outerAngle);

            // displacements to translate the current loop
            // from <0,0,0> to its position in the torus
            const displaceX = cosOuterAngle * this.outerRadius;
            const displaceY = sinOuterAngle * this.outerRadius;

            // iterating around the inner radius
            for (let j = 0; j <= this.slices; j++) {
                // current inner angle
                const innerAngle = (j % this.slices) * stepInner;

                // coordinates of the vertex at current slice
                // without taking into account the loop it's in
                const x = Math.cos(innerAngle) * this.innerRadius;
                const z = Math.sin(innerAngle) * this.innerRadius;

                // rotate the current slice by outerAngle around Z axis
                // and translate it by the displacement{X,Y}
                this.vertices.push(
                    x * cosOuterAngle + displaceX,
                    x * sinOuterAngle + displaceY,
                    z
                );

                // normal of the vertex is the coordinate of the slice
                // (without taking into account loop) and rotate it by
                // outerAngle around the Z axis
                this.normals.push(
                    ...normalizeVector([
                        x * cosOuterAngle,
                        x * sinOuterAngle,
                        z,
                    ])
                );

                this.texCoords.push(j / this.slices, i / this.loops);
            }
        }

        // make triangles with the vertices from consecutive stacks
        for (let i = 0; i < this.loops; i++) {
            for (let j = 0; j < this.slices; j++) {
                // index of a vertex in the current stack
                const indexVertex = i * (this.slices + 1) + j;
                // index of the vertex on top of the vertex in the current stack
                const indexVertexTop = indexVertex + this.slices + 1;

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
