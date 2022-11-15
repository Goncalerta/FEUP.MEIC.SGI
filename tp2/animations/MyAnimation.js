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
    }

    /**
     * Updates the animation.
     * @param {number} t - Current time in milliseconds.
     */
    update(t) {
        throw new Error("Method 'update(t)' must be implemented.");
    }

    /**
     * Applies the animation.
     */
    apply() {
        throw new Error("Method 'apply()' must be implemented.");
    }
}
