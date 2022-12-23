import { CGFobject, CGFtexture } from '../../lib/CGF.js';
import { arraysEqual } from '../utils.js';

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
    constructor(scene, geometries, textures, texturesSelected, model, pickingId, tileSize, height, playerId = 1, position = [0, 0], topOffset = 0.01) {
        super(scene);

        this.model = model;

        this.tileSize = tileSize;
        this.setPosition(position);
        this.geometries = geometries;
        this.selected = false;
        this.texture = textures;
        this.texturesSelected = texturesSelected;
        this.pickingId = pickingId;
        this.playerId = playerId;

        this.height = height;

        // TODO basically promotion will be animated by rotating the checker and then the offset will pop from 0.01 to 1.0
        this.topOffset = topOffset;
    }

    setPosition(position) {
        this.position = [(position[0] - 3.5) * this.tileSize, -(position[1] - 3.5) * this.tileSize];
        this.boardPosition = position;
    }

    onClick(id) {
        this.model.state.selectPiece(...this.boardPosition);
    }

    /**
     * Displays the checker
     */
    display() {
        const selected = arraysEqual(this.model.state.getSelectedPiece(), this.boardPosition);
        const texture = selected? this.texturesSelected : this.texture;

        this.scene.registerForPick(this.pickingId, this);
        this.scene.pushMatrix();

        
        
        this.scene.translate(this.position[0], this.height, this.position[1]);
        if (this.playerId === 1) {
            this.scene.rotate(Math.PI, 0, 1, 0);
        }
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        

        texture["side"].apply();
        this.geometries["major_cylinder"].display();

        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.topOffset*this.height);
        this.geometries["minor_cylinder"].display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.height);
        texture["unpromoted_base"].apply();
        this.geometries["major_circle"].display();

        this.scene.translate(0, 0, this.topOffset*this.height);
        texture["promoted_base"].apply();
        this.geometries["minor_circle"].display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 1, 0, 0);
        texture["unpromoted_base"].apply();
        this.geometries["major_circle"].display();
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
}
