import { identity } from './EasingFunctions.js';

/**
 * Represents a generic animation, which may change more than just transformations, and which is triggered by a runtime event.
 */
export class EventAnimation {
    /**
     * @constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {number} duration - Duration of the animation in seconds.
     * @param {function} easingFunction - Easing function to be used.
     */
    constructor(scene, duration, easingFunction=identity) {
        this.scene = scene;
        this.duration = duration * 1000;
        this.easingFunction = easingFunction;
        this.onStartCallback = [];
        this.onEndCallback = [];
        this.onUpdateCallback = [];
        this.params = {};
        this.over = false;
    }

    /**
     * Adds a callback to be called when the animation starts.
     * @param {function} onStart - Callback function.
     */
    onStart(onStart) {
        this.onStartCallback.push(onStart);
    }

    /**
     * Adds a callback to be called when the animation ends.
     * @param {function} onEnd - Callback function.
     */
    onEnd(onEnd) {
        this.onEndCallback.push(onEnd);
    }

    /**
     * Adds a callback to be called when the animation updates.
     * @param {function} onUpdate - Callback function.
     */
    onUpdate(onUpdate) {
        this.onUpdateCallback.push(onUpdate);
    }

    /**
     * Sets the duration of the animation.
     * @param {number} duration - Duration of the animation in seconds.
     */
    setDuration(duration) {
        this.duration = duration * 1000;
    }

    /**
     * Starts the animation.
     * @param {number} t - Current time in milliseconds.
     */
    start(t) {
        this.onStartCallback.forEach(f => f(this.params));
        this.startTime = t;
        this.endTime = this.duration + t;
        this.scene.animate(this);
        this.update(t);
    }

    /**
     * Interrupts the animation.
     */
    interrupt() {
        this.scene.removeAnimation(this);
        this.over = true;
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
        if (t >= this.endTime) {
            this.t = 1;
            
            if (this.over) {
                return;
            }
    
            this.onEndCallback.forEach(f => f(this.params));
    
            this.interrupt();

            return;
        }

        const param = (t - this.startTime) / this.duration;
        
        if (Array.isArray(this.easingFunction)) {
            this.t = this.easingFunction.map(f => f(param));
        } else {
            this.t = this.easingFunction(param);
        }

        this.onUpdateCallback.forEach(f => f(this.t, this.params));
    }
}
