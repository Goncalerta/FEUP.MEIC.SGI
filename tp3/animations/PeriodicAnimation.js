import { identity, loopbackFunction } from "./EasingFunctions.js";

/**
 * Represents a generic animation, which may change more than just transformations, and which is happens periodically, perpetually.
 */
export class PeriodicAnimation {
    /**
     * @constructor
     * @param {CGFscene} scene - Reference to MyScene object
     */
    constructor(scene, duration, easingFunction=identity, loopback=false) {
        this.scene = scene;
        this.duration = duration * 1000;
        this.easingFunction = easingFunction;

        if (loopback) {
            this.duration *= 2;
            if (Array.isArray(this.easingFunction)) {
                this.easingFunction = easingFunction.map(loopbackFunction);
            } else {
                this.easingFunction = loopbackFunction(easingFunction);
            }
        }
    }

    /**
     * Starts the animation.
     */
    start() {
        this.scene.animate(this);
        this.t = 0;
    }

    /**
     * Get the animation'c current time.
     * @returns {number} Current time.
     */
    get() {
        return this.t;
    }

    /**
     * Updates the animation.
     * @param {number} t - Current time in milliseconds.
     */
    update(t) {
        if (!this.startTime) {
            this.startTime = t;
            this.endTime = this.duration + t;
        }

        let param = (t % this.duration) / this.duration;
        
        if (Array.isArray(this.easingFunction)) {
            this.t = this.easingFunction.map(f => f(param));
        } else {
            this.t = this.easingFunction(param);
        }
    }
}
