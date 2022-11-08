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
        this.time = 0; // TODO component should be invisible until the first keyframe instant
    }

    update(t) {
        throw new Error("Method 'update(t)' must be implemented.");
    };

    apply() {
        throw new Error("Method 'apply()' must be implemented.");
    };
}
