const Transformations = {
    Translation: 0,
    RotationZ: 1,
    RotationY: 2,
    RotationX: 3,
    Scaling: 4
};

export class MyTransformation {
    /**
     * @constructor
     * @param {Transformations} type - Type of transformation
     * @param {Array} args - Transformation arguments
     */
    constructor(type, args) {
        this.type = type;
        this.args = args;
    }

    /**
     * Interpolates between two transformations.
     * @param {MyTransformation} transformation - Transformation to interpolate `this` with
     * @param {number} ratio - Interpolation ratio
     * @returns {MyTransformation} Interpolated transformation
     */
    interpolate(transformation, ratio) {
        if (this.type !== transformation.type) {
            return null;
        }

        const interpolatedArgs = [];
        for (let i = 0; i < this.args.length; i++) {
            interpolatedArgs.push(this.args[i] + (transformation.args[i] - this.args[i]) * ratio);
        }

        return new MyTransformation(this.type, interpolatedArgs);
    }
}
