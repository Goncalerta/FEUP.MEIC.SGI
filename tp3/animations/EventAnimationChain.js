import { identity } from './EasingFunctions.js';

/**
 * Represents a generic animation, which may change more than just transformations, and which is triggered by a runtime event.
 */
export class EventAnimationChain {
    /**
     * @constructor
     * @param {CGFscene} scene - Reference to MyScene object
     */
    constructor() {
        this.animations = [];
        this.onEndCallback = [];
        this.currentAnimation = 0;
    }

    push(...animations) {
        this.animations.push(...animations);
    }

    onEnd(onEnd) {
        this.onEndCallback.push(onEnd);
    }

    start(t) {
        for (let i = 0; i < this.animations.length - 1; i++) {
            this.animations[i].onEnd(() => {
                this.currentAnimation = i + 1;
                this.animations[i + 1].start(this.animations[i].endTime);
            });
        }

        for (let i = 0; i < this.onEndCallback.length; i++) {
            this.animations[this.animations.length - 1].onEnd(this.onEndCallback[i]);
        }

        this.animations[0].start(t);
    }

    interrupt() {
        this.animations[this.currentAnimation].interrupt();
    }
}
