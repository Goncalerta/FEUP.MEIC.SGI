import {CGFobject} from '../lib/CGF.js';
import { normalizeVector } from './utils.js';

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

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const stepInner = Math.PI*2 / this.slices;
        const stepOuter = Math.PI*2 / this.loops;

        for (let i = 0; i <= this.loops; i++) {
            const outerAngle = (i % this.loops) * stepOuter;
            const displaceX = Math.cos(outerAngle) * this.outerRadius;
            const displaceY = Math.sin(outerAngle) * this.outerRadius;

            for (let j = 0; j <= this.slices; j++) {
                const innerAngle = (j % this.slices) * stepInner;

                const x = Math.cos(innerAngle) * this.innerRadius;
                const z = Math.sin(innerAngle) * this.innerRadius;

                this.vertices.push(
                    x * Math.cos(outerAngle) + displaceX,
                    x * Math.sin(outerAngle) + displaceY,
                    z
                );
                
                this.normals.push(...normalizeVector([x * Math.cos(outerAngle), x * Math.sin(outerAngle), z]));

                this.texCoords.push(j / this.slices, i / this.loops);
            }
        }

        for (let i = 0; i < this.loops; i++) {
            for (let j = 0; j < this.slices; j++) {
                const indexVertex = i * (this.slices + 1) + j;
                const indexVertexTop = indexVertex + this.slices + 1;

                this.indices.push(indexVertex, indexVertexTop + 1, indexVertex + 1)
                this.indices.push(indexVertex, indexVertexTop, indexVertexTop + 1)
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateTexCoords(new_length_s, new_length_t) {
        // Nao é necessario aplicar fatores de escala em superficies quadricas
    }
}
