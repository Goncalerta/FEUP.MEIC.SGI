
export class MyKeyframeAnimation {
    /**
     * @constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {string} id - Id of the animation
     */
    constructor(scene, id) {
        this.scene = scene;
        this.id = id;
        this.matrix = mat4.create();
        this.keyFrames = [];
        this.time = 0; // TODO component should be invisible until the first keyframe instant
    }

    addKeyFrame(keyFrame) {
        this.keyFrames.push(keyFrame);
    }

    apply() {
        this.scene.multMatrix(this.matrix);
    }

    computeAnimation(deltaTime) {
        this.time += deltaTime;

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
            this.matrix = keyFrame.matrix;
        } else {
            const ratio = (this.time - keyFrame.getInstant()) / (this.keyFrames[i].getInstant() - keyFrame.getInstant());

            const interpolatedKeyFrame = keyFrame.interpolate(this.keyFrames[i], ratio);
            this.matrix = interpolatedKeyFrame.calculateMatrix();
        }
    }
}
