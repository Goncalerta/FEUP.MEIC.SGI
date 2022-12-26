import { identity } from './EasingFunctions.js';

/**
 * Represents a generic animation, which may change more than just transformations, and which is triggered by a runtime event.
 */
export class EventAnimation {
    /**
     * @constructor
     * @param {CGFscene} scene - Reference to MyScene object
     */
    constructor(scene, duration, easingFunction=identity, onEnd=null, onUpdate=null) {
        this.scene = scene;
        this.duration = duration * 1000;
        this.easingFunction = easingFunction;
        this.onEndCallback = onEnd;
        this.onUpdateCallback = onUpdate;
        this.over = false;
    }

    onEnd(onEnd) {
        this.onEndCallback = onEnd;
    }

    onUpdate(onUpdate) {
        this.onUpdateCallback = onUpdate;
    }

    start(t) {
        this.startTime = t;
        this.endTime = this.duration + t;
        this.scene.animate(this);
        this.update(t);
    }

    interrupt() {
        this.scene.removeAnimation(this);
        this.over = true;
    }

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
    
            if (this.onEndCallback) {
                this.onEndCallback();
            }
    
            this.interrupt();

            return;
        }

        const param = (t - this.startTime) / this.duration;
        
        if (Array.isArray(this.easingFunction)) {
            this.t = this.easingFunction.map(f => f(param));
        } else {
            this.t = this.easingFunction(param);
        }

        if (this.onUpdateCallback) {
            this.onUpdateCallback(this.t);
        }
    }
}
