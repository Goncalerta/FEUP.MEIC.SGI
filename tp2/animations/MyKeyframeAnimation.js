import { MyAnimation } from "./MyAnimation.js";

export class MyKeyframeAnimation extends MyAnimation {
    /**
     * @constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {string} id - Id of the animation
     */
    constructor(scene, id) {
        super(scene, id);

        this.matrix = mat4.create();
        this.keyFrames = [];
        this.elapsedTime = null;
    }

    /**
     * Checks if the animation has already started (is visible).
     */
    isVisible() {
        return this.elapsedTime != null && this.elapsedTime >= this.keyFrames[0].getInstant();
    }

    /**
     * Adds a keyframe to the animation.
     * @param {MyKeyframe} keyFrame - The keyframe to add.
     */
    addKeyframe(keyFrame) {
        this.keyFrames.push(keyFrame);
    }

    /**
     * Gets the keyFrames
     */
    getKeyFrames() {
        return this.keyFrames;
    }

    /**
     * Applies the animation.
     */
    apply() {
        this.scene.multMatrix(this.matrix);
    }

    /**
     * Updates the animation.
     * @param {number} t - Current time in milliseconds.
     */
    update(t) {
        this.elapsedTime = t - this.scene.startTime;

        if (this.elapsedTime > this.keyFrames[this.keyFrames.length - 1].getInstant()) {
            this.elapsedTime = this.keyFrames[this.keyFrames.length - 1].getInstant();
        }

        let keyFrame = this.keyFrames[0];
        let i = 1;
        for (; i < this.keyFrames.length; i++) {
            if (this.elapsedTime < this.keyFrames[i].getInstant()) {
                break;
            }
            keyFrame = this.keyFrames[i];
        }

        if (i == this.keyFrames.length) {
            this.matrix = keyFrame.calculateMatrix();
        } else {
            const ratio = (this.elapsedTime - keyFrame.getInstant()) / (this.keyFrames[i].getInstant() - keyFrame.getInstant());

            const interpolatedKeyFrame = keyFrame.interpolate(this.keyFrames[i], ratio);
            this.matrix = interpolatedKeyFrame.calculateMatrix();
        }
    }
}
