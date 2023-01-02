/** 
 * Defines functions that take as input a normalized time from 0 to 1 (start to end of an animation)
 * and return a parameter for the animation state. The parameter typically goes from 0 to 1 in a smooth
 * curve, but can be any function that is convenient for some particular animation.
 * */ 

/**
 * Linear funtion.
 * @param {number} t - Normalized time.
 */
export function identity(t) {
    return t;
}

/**
 * Generic quadratic funtion.
 * @param {number} a - scale factor.
 * @param {number} h - horizontal shift.
 * @param {number} k - vertical shift.
 * @returns {function} The resulting easing function.
 */
export function quad(a, h, k) {
    return (t) => a*(t-h)**2 + k;
}

/**
 * Peak in a smooth curve, starting and ending at 0.
 * @param {number} t - Normalized time.
 */
export function smoothPeak(t) {
    return 1.27325359122*Math.exp(-5*Math.abs(t-0.5)**1.7) - 0.27325359122;
}

/**
 * Pop and then vanish to 0.
 * @param {number} t - Normalized time.
 */
export function popAndDisappear(t) {
    return Math.sqrt(1-(1.85*t-0.85)**2);
}

/**
 * Quadratic ease in.
 * @param {number} t - Normalized time.
 */
export function easeInQuad(t) {
    return t**2;
}

/**
 * Quadratic ease out.
 * @param {number} t - Normalized time.
 */
export function easeOutQuad(t) {
    return 1 - (1 - t)**2;
}

/**
 * Cubic ease in.
 * @param {number} t - Normalized time.
 */
export function easeInCubic(t) {
    return t**3;
}

/**
 * Cubic ease out.
 * @param {number} t - Normalized time.
 */
export function easeOutCubic(t) {
    return 1 - (1 - t)**3;
}

/**
 * Takes a function and returns a function that goes twice as fast, using the
 * spare time to reverse the animation.
 * @param {function} f - Function to loop back.
 * @returns {function} The resulting easing function.
 */
export function loopbackFunction(f) {
    return (t) => t > 0.5? f(2 - 2*t) : f(2*t);
}

/**
 * Quadratic with a minimum value that starts and ends at 1.
 * @param {number} min - minimum value.
 * @returns the resulting easing function.
 */
export function quadMin(min) {
    const h = 0.5;
    const k = min;
    const a = (1 - k) / h**2;
    return (t) => quad(a, h, k)(t);
}
