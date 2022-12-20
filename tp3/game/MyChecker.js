import { CGFobject, CGFtexture } from '../../lib/CGF.js';
import { MyCircle } from '../MyCircle.js';
import { MyCylinder } from '../MyCylinder.js';


/**
 * MyChecker class, representing a checker.
 */
export class MyChecker extends CGFobject {
    MATERIAL = {
        shininess: 10,
        emission:  [1.0, 1.0, 1.0, 1.0],
        ambient:   [0.0, 0.0, 0.0, 1.0],
        diffuse:   [0.0, 0.0, 0.0, 1.0],
        specular:  [0.0, 0.0, 0.0, 1.0]
    };

    TOP_TEXTURE = "scenes/images/game/crown_test.png";
    CYLINDER_TEXTURE = "scenes/images/space/wood_barrel_side.jpg";

    /**
     * @method constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {float} radius - Radius of the checker's base
     * @param {float} height - Height of the checker (along Z axis)
     * @param {integer} slices - Number of divisions around the Z axis (circumference)
     * @param {integer} stacks - Number of divisions along the Z axis
     */
    constructor(scene, radius, height, pickingId, slices=50, stacks=10) {
        super(scene);

        this.radius = radius;
        this.height = height;
        this.slices = Math.ceil(slices);
        this.stacks = Math.ceil(stacks);
        this.pickingId = pickingId

        this.cylinder = new MyCylinder(scene, radius, radius, height, slices, stacks);
        this.circle = new MyCircle(scene, radius, [0, 0, 0], slices);

        this.topsTexture = new CGFtexture(this.scene, this.TOP_TEXTURE);
        this.cylinderTexture = new CGFtexture(this.scene, this.CYLINDER_TEXTURE);
    }

    onClick(id) {
        // TODO
        console.log("Clicked checker with id " + id)
    }

    /**
     * Displays the checker
     */
    display() {
        this.scene.registerForPick(this.pickingId, this);
        this.scene.pushMatrix();

        this.scene.pushAppearance(this.MATERIAL, this.topsTexture);
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
        this.scene.pushAppearance(this.MATERIAL, this.cylinderTexture);
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
