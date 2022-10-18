import { CGFobject } from '../lib/CGF.js';
import { applyLengthsToTextureCoords } from './utils.js';
/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
export class MyRectangle extends CGFobject {
    constructor(scene, x1, x2, y1, y2) {
        super(scene);
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;

        this.initBuffers();
    }
    
    initBuffers() {
        this.vertices = [
            this.x1, this.y1, 0,    //0
            this.x2, this.y1, 0,    //1
            this.x1, this.y2, 0,    //2
            this.x2, this.y2, 0        //3
        ];

        //Counter-clockwise reference of vertices
        this.indices = [
            0, 1, 2,
            1, 3, 2
        ];

        //Facing Z positive
        this.normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ];
        
        // No need to divide by this.length_s and length_t since they start as 1.0
        this.texCoords = [
            0, 1,
            1, 1,
            0, 0,
            1, 0
        ]
        this.baseTexCoords = this.texCoords;
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
    
    updateTexCoords(length_s, length_t) {
        this.texCoords = applyLengthsToTextureCoords(this.baseTexCoords, length_s, length_t);
        this.updateTexCoordsGLBuffers();
    }
}
