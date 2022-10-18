import { CGFobject } from "../lib/CGF.js";
import { normalizeVector } from "./utils.js";

/**
 * MySphere class, representing a sphere.
 */
export class MySphere extends CGFobject {
    /**
     * @method constructor
     * @param  {CGFscene} scene - MyScene object
     * @param  {float} radius - Sphere radius
     * @param  {integer} slices - number of slices around Z axis
     * @param  {integer} stacks - number of stacks along Z axis, from the center to the poles (half of sphere)
     */
    constructor(scene, radius, slices, stacks) {
        super(scene);

        this.radius = radius;
        this.latDivs = stacks * 2;
        this.longDivs = slices;

        this.initBuffers();
    }

    /**
     * @method initBuffers
     * Initializes the sphere buffers
     */
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        let phi = 0;
        let theta = 0;
        const phiInc = Math.PI / this.latDivs;
        const thetaInc = (2 * Math.PI) / this.longDivs;
        const latVertices = this.longDivs + 1;

        // build an all-around stack at a time, starting on "north pole" and proceeding "south"
        for (let latitude = 0; latitude <= this.latDivs; latitude++) {
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            // in each stack, build all the slices around, starting on longitude 0
            theta = 0;
            for (let longitude = 0; longitude <= this.longDivs; longitude++) {
                // Vertices coordinates (unit radius)
                const [x, y, z] = normalizeVector([
                    Math.sin(-theta) * sinPhi,
                    Math.cos(theta) * sinPhi,
                    cosPhi,
                ]);

                this.vertices.push(
                    x * this.radius,
                    y * this.radius,
                    z * this.radius
                );

                // Indices
                if (latitude < this.latDivs && longitude < this.longDivs) {
                    const current = latitude * latVertices + longitude;
                    const next = current + latVertices;
                    // pushing two triangles using indices from this round (current, current+1)
                    // and the ones directly south (next, next+1)
                    // (i.e. one full round of slices ahead)

                    this.indices.push(current + 1, current, next);
                    this.indices.push(current + 1, next, next + 1);
                }

                // Normals
                // at each vertex, the direction of the normal is equal to
                // the vector from the center of the sphere to the vertex.
                this.normals.push(x, y, z);
                theta += thetaInc;

                // Texture Coordinates
                this.texCoords.push(
                    (longitude * 1) / this.longDivs,
                    (latitude * 1) / this.latDivs
                );
            }

            phi += phiInc;
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * Updates texture coordinates based on length_s and length_t
     * @param length_s
     * @param length_t
     */
    updateTexCoords(length_s, length_t) {
        // We don't need to update tex coords in quadrics
    }
}
