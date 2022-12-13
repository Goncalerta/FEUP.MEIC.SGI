import { CGFobject, CGFtexture } from '../../lib/CGF.js';
import { MyCircle } from '../MyCircle.js';
import { MyCylinder } from '../MyCylinder.js';


/**
 * MyChecker class, representing a checker.
 */
export class MyChecker extends CGFobject {
    /**
     * @method constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {float} radius - Radius of the checker's base
     * @param {float} height - Height of the checker (along Z axis)
     * @param {integer} slices - Number of divisions around the Z axis (circumference)
     * @param {integer} stacks - Number of divisions along the Z axis
     */
    constructor(scene, radius, height, pickingId, slices, stacks) {
        super(scene);

        this.radius = radius;
        this.height = height;
        this.slices = Math.ceil(slices);
        this.stacks = Math.ceil(stacks);
        this.pickingId = pickingId

        this.cylinder = new MyCylinder(scene, radius, radius, height, slices, stacks);
        this.circle = new MyCircle(scene, radius, [0, 0, 0], slices);

        // TODO just to test, remove later (?) vv
        this.material = {
            shininess: 10,
            emission: [1.0, 1.0, 1.0, 1.0],
            ambient: [0.0, 0.0, 0.0, 1.0],
            diffuse: [0.0, 0.0, 0.0, 1.0],
            specular: [0.0, 0.0, 0.0, 1.0],
        };
        
        this.topsTexture = new CGFtexture(this.scene, "scenes/images/game/crown_test.png");
        this.cylinderTexture = new CGFtexture(this.scene, "scenes/images/space/wood_barrel_side.jpg");
        // ^^
    }

    onClick(id) {
        // TODO
    }

    /**
     * Displays the checker
     */
    display() {
        //this.scene.registerForPick(this.pickingId, this);
        this.scene.pushMatrix();

        this.scene.pushAppearance(this.material, this.topsTexture);
        this.scene.translate(0, this.height, 0);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);

        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.height);
        this.circle.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 1, 0, 0);
        this.circle.display();
        this.scene.popMatrix();

        this.scene.popAppearance();

        this.scene.pushMatrix();
        this.scene.pushAppearance(this.material, this.cylinderTexture);
        this.cylinder.display();
        this.scene.popAppearance();
        this.scene.popMatrix();

        this.scene.popMatrix();
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
