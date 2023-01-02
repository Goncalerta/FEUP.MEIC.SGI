import { getAppearance, interpolate } from "../utils.js";
import { MyCircle } from "../MyCircle.js";
import { easeOutCubic } from "../animations/EasingFunctions.js";
import { PeriodicAnimation } from "../animations/PeriodicAnimation.js";


/**
 * MyBoardHintGroup class, representing the game board hints.
 */
export class MyBoardHintGroup {
    MATERIAL = {
        shininess: 5,
        emission: [0.05, 0.75, 0.01, 1.0],
        ambient: [0, 0.1, 0, 1.0],
        diffuse: [0, 0, 0, 1.0],
        specular: [0, 0, 0, 1.0],
    };

    MATERIAL_GLOW = {
        shininess: 5,
        emission: [0.3, 1.0, 0.3, 1.0],
        ambient: [0.2, 0.2, 0.2, 1.0],
        diffuse: [0.05, 0.05, 0.05, 1.0],
        specular: [0, 0, 0, 1.0],
    };

    /**
     * @constructor
     * @param scene Reference to MyScene object.
     * @param model Reference to MyGameModel object.
     * @param tileSize Size of a tile.
     */
    constructor(scene, model, tileSize) {
        this.scene = scene;
        this.model = model;
        this.tileSize = tileSize;
        
        this.hintGeometry = new MyCircle(scene, tileSize*0.3, [0, 0, 0], 20);
        this.animation = new PeriodicAnimation(scene, 1, easeOutCubic, true);
        this.animation.start();
    }

    /**
     * Displays the board hints.
     */
    display() {
        const moves = this.model.state.getMoveHints();
        getAppearance(this.scene, interpolate(this.MATERIAL, this.MATERIAL_GLOW, this.animation.get())).apply();
        for (let i = 0; i < moves.length; i++) {
            const [x, y] = moves[i];
            const position = [(x-3.5)*this.tileSize, -(y-3.5)*this.tileSize];
            const height = 0.01;

            this.scene.pushMatrix();
            this.scene.translate(position[0], height, position[1]);
            this.scene.scale(this.animation.get()*0.4 + 0.6, 1, this.animation.get()*0.4 + 0.6);
            this.scene.rotate(-Math.PI / 2, 1, 0, 0);
            this.hintGeometry.display();
            this.scene.popMatrix();
        }
    }
}
