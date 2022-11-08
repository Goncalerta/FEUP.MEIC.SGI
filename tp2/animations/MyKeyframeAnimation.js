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
    }

    addKeyframe(keyFrame) {
        this.keyFrames.push(keyFrame);
    }

    getKeyFrames() {
        return this.keyFrames;
    }

    apply() {
        this.scene.multMatrix(this.matrix);
    }

    update(t) {
        this.time = t;

        if (this.time > this.keyFrames[this.keyFrames.length - 1].getInstant()) {
            this.time = this.keyFrames[this.keyFrames.length - 1].getInstant();
        }

        let keyFrame = this.keyFrames[0];
        let i = 1;
        for (; i < this.keyFrames.length; i++) {
            if (this.time < this.keyFrames[i].getInstant()) {
                break;
            }
            keyFrame = this.keyFrames[i];
        }

        if (i == this.keyFrames.length) {
            this.matrix = keyFrame.calculateMatrix();
        } else {
            const ratio = (this.time - keyFrame.getInstant()) / (this.keyFrames[i].getInstant() - keyFrame.getInstant());

            const interpolatedKeyFrame = keyFrame.interpolate(this.keyFrames[i], ratio);
            this.matrix = interpolatedKeyFrame.calculateMatrix();
        }
    }
}
