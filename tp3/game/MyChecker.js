import { CGFobject } from '../../lib/CGF.js';

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
    constructor(scene, geometries, textures, model, pickingId, tileSize, height, player = 1, position = [0, 0], topOffset = 0.01) {
        super(scene);

        this.model = model;

        this.tileSize = tileSize;
        this.position = [(position[0] - 3.5) * tileSize, -(position[1] - 3.5) * tileSize];
        this.geometries = geometries;
        this.textures = textures;
        this.pickingId = pickingId;
        this.player = player;

        this.height = height;

        // TODO basically promotion will be animated by rotating the checker and then the offset will pop from 0.01 to 1.0
        this.topOffset = topOffset;
    }

    onClick(id) {
        // TODO
        console.log("Clicked checker with id " + id + " at position " + [this.position[0]/this.tileSize + 3.5, -this.position[1]/this.tileSize + 3.5]);
        this.model.state.selectPiece(this.position[0]/this.tileSize + 3.5, -this.position[1]/this.tileSize + 3.5);
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
        this.scene.translate(0, 0, this.topOffset*this.height);
        this.geometries["minor_cylinder"].display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.height);
        this.textures["unpromoted_base"].apply();
        this.geometries["major_circle"].display();

        this.scene.translate(0, 0, this.topOffset*this.height);
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
