/**
 * Represents a generic animation, which may change more than just transformations, and which is triggered by a runtime event.
 */
export class EventAnimationChain {
    /**
     * @constructor
     */
    constructor() {
        this.animations = [];
        this.onEndCallback = [];
        this.currentAnimation = 0;
    }

    /**
     * Adds animations to the chain.
     * @param {...MyAnimation} animations - Animations to add.
     */
    push(...animations) {
        this.animations.push(...animations);
    }

    /**
     * Adds a callback to be called when the animation ends.
     * @param {function} onEnd - Callback to be called.
     */
    onEnd(onEnd) {
        this.onEndCallback.push(onEnd);
    }

    /**
     * Starts the animation.
     * @param {number} t - Current time in milliseconds.
     */
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

    /**
     * Interrupts the animation.
     */
    interrupt() {
        this.animations[this.currentAnimation].interrupt();
    }
}
