import {CGFobject, CGFnurbsSurface, CGFnurbsObject} from '../lib/CGF.js';

/**
 * MyPatch class, representing a NURB.
 */
export class MyPatch extends CGFobject {
    /**
     * @constructor
     * @param scene Reference to MyScene object.
     * @param x1 x coordinate of first point.
     * @param x2 x coordinate of second point.
     * @param y1 y coordinate of first point.
     * @param y2 y coordinate of second point.
     */
    constructor(scene, degreeU, partsU, degreeV, partsV, controlPoints) {
        super(scene);
        this.degreeU = degreeU;
        this.partsU = partsU;
        this.degreeV = degreeV;
        this.partsV = partsV;
        this.controlPoints = controlPoints;

        this.surface = new CGFnurbsSurface(this.degreeU, this.degreeV, controlPoints);
        this.object = new CGFnurbsObject(this.scene, this.partsU, this.partsV, this.surface);
    }

    display() {
        this.object.display();
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
