/**
 * Represents a generic animation, which may change more than just transformations, and which is triggered by a runtime event.
 */
export class EventAnimation {
    /**
     * @constructor
     * @param {CGFscene} scene - Reference to MyScene object
     */
    constructor(scene, duration, easingFunction=identity, onEnd=null) {
        this.scene = scene;
        this.duration = duration * 1000;
        this.easingFunction = easingFunction;
        this.onEndCallback = onEnd;
        this.over = false;
    }

    start(t) {
        this.startTime = t;
        this.endTime = this.duration + t;
        this.scene.animate(this);
        this.update(t);
    }

    get() {
        return this.t;
    }

    onEnd() {
        if (this.over) {
            return;
        }

        if (this.onEndCallback) {
            this.onEndCallback();
        }

        this.scene.removeAnimation(this);
        
        this.over = true;
    }

    /**
     * Updates the animation.
     * @param {number} t - Current time in milliseconds.
     */
    update(t) {
        if (t >= this.endTime) {
            this.t = 1;
            this.onEnd();
            return;
        }

        const param = (t - this.startTime) / this.duration;
        
        if (Array.isArray(this.easingFunction)) {
            this.t = this.easingFunction.map(f => f(param));
        } else {
            this.t = this.easingFunction(param);
        }
    }
}
