/**
 * MyAnimation class, representing an animation of transformations.
 */
export class MyAnimation {
    /**
     * @constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {string} id - Id of the animation
     */
    constructor(scene, id) {
        if (this.constructor == MyAnimation) {
            throw new Error("MyAnimation is an abstract class.");
        }

        this.scene = scene;
        this.id = id;
        this.matrix = mat4.create();
    }

    /**
     * Updates the animation.
     * @param {number} t - Current time in milliseconds.
     */
    update(t) {
        this.elapsedTime = t - this.scene.startTime;
    }

    /**
     * Applies the animation.
     */
    apply() {
        this.scene.multMatrix(this.matrix);
    }
}
