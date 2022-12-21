import { CGFobject, CGFtexture } from '../../lib/CGF.js';

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
    constructor(scene, geometries, textures, pickingId, height, player = 1, position = [0, 0], topOffset = 0.0001) {
        super(scene);

        this.position = position;
        this.geometries = geometries;
        this.textures = textures;
        this.pickingId = pickingId;
        this.player = player;

        this.height = height;
        this.topOffset = topOffset;
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

        
        
        this.scene.translate(this.position[0], this.height, this.position[1]);
        if (this.player === 1) {
            this.scene.rotate(Math.PI, 0, 1, 0);
        }
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        

        this.textures["side"].apply();
        this.geometries["major_cylinder"].display();

        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.topOffset);
        this.geometries["minor_cylinder"].display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.height);
        this.textures["unpromoted_base"].apply();
        this.geometries["major_circle"].display();

        this.scene.translate(0, 0, this.topOffset);
        this.textures["promoted_base"].apply();
        this.geometries["minor_circle"].display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 1, 0, 0);
        this.textures["unpromoted_base"].apply();
        this.geometries["major_circle"].display();
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
}
