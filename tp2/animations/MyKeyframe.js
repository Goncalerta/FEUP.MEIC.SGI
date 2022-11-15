import { MyTransformation } from "./MyTransformation.js";

const DEGREE_TO_RAD = Math.PI / 180;


export class MyKeyframe {
    /**
     * @constructor
     * @param {number} instant - Instant of the keyframe
     * @param {MyTransformation} translation - Translation of the keyframe
     * @param {MyTransformation} rotationZ - Rotation around Z of the keyframe
     * @param {MyTransformation} rotationY - Rotation around Y of the keyframe
     * @param {MyTransformation} rotationX - Rotation around X of the keyframe
     * @param {MyTransformation} scaling - Scaling of the keyframe
     */
    constructor(instant, translation, rotationZ, rotationY, rotationX, scaling) {
        this.instant = instant;
        this.translation = translation;
        this.rotationZ = rotationZ;
        this.rotationY = rotationY;
        this.rotationX = rotationX;
        this.scaling = scaling;
    }

    /**
     * Gets the instant of the keyframe.
     * @returns {number} Instant of the keyframe
     */
    getInstant() {
        return this.instant;
    }

    /**
     * Interpolates between two keyframes.
     * @param {MyKeyframe} keyframe - Keyframe to interpolate `this` with
     * @param {number} ratio - Interpolation ratio
     * @returns {MyKeyframe} Interpolated keyframe
     */
    interpolate(keyframe, ratio) {
        const interpolatedTranslation = this.translation.interpolate(keyframe.translation, ratio);
        const interpolatedRotationZ = this.rotationZ.interpolate(keyframe.rotationZ, ratio);
        const interpolatedRotationY = this.rotationY.interpolate(keyframe.rotationY, ratio);
        const interpolatedRotationX = this.rotationX.interpolate(keyframe.rotationX, ratio);
        const interpolatedScaling = this.scaling.interpolate(keyframe.scaling, ratio);

        return new MyKeyframe(this.instant + (keyframe.instant - this.instant) * ratio, interpolatedTranslation, interpolatedRotationZ, interpolatedRotationY, interpolatedRotationX, interpolatedScaling);
    }

    /**
     * Calculates the matrix of the keyframe.
     * @returns {mat4} Matrix of the keyframe
     */
    calculateMatrix() {
        const matrix = mat4.create();

        mat4.translate(matrix, matrix, this.translation.args);
        mat4.rotateZ(matrix, matrix, this.rotationZ.args[0] * DEGREE_TO_RAD);
        mat4.rotateY(matrix, matrix, this.rotationY.args[0] * DEGREE_TO_RAD);
        mat4.rotateX(matrix, matrix, this.rotationX.args[0] * DEGREE_TO_RAD);
        mat4.scale(matrix, matrix, this.scaling.args);

        return matrix;
    } 
}
