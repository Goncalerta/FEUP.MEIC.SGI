import { CGFobject } from '../../lib/CGF.js';
import { accelDecel, easeOutCubic, easeInCubic, identity } from '../animations/EasingFunctions.js';
import { EventAnimation } from '../animations/EventAnimation.js';

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

    calculatePosition(position) {
        return [(position[0] - 3.5) * this.tileSize, -(position[1] - 3.5) * this.tileSize];
    }

    setPosition(position) {
        this.position = this.calculatePosition(position);
        this.boardPosition = position;
    }

    animateMove(move) {
        const startPosition = this.calculatePosition(move.from);
        const endPosition = this.calculatePosition(move.to);
        const deltaPosition = [endPosition[0] - startPosition[0], endPosition[1] - startPosition[1]];
        const absDelta = Math.abs(move.to[0] - move.from[0]);

        const accelerationTime = 0.5;
        const duration = 2 * accelerationTime + (absDelta - 1)/3;
        const xRatio = accelerationTime / duration;
        const yRatio = 0.5 / absDelta;

        const onEnd = () => {
            this.setPosition(move.to);
        };

        const onUpdate = (t) => {
            this.position = [
                startPosition[0] + deltaPosition[0] * t,
                startPosition[1] + deltaPosition[1] * t,
            ];
        };

        const animation = new EventAnimation(this.scene, duration, accelDecel(easeInCubic, identity, easeOutCubic, xRatio, yRatio), onEnd, onUpdate);
        animation.start(this.scene.currentTime);
    }

    onClick(id) {
        this.model.state.selectPiece(this, ...this.boardPosition);
    }

    /**
     * Displays the checker
     */
    display() {
        const selected = this.model.state.getSelectedPiece() === this;
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
