export function identity(t) {
    return t;
}

export function quad(a, h, k) {
    return (t) => a*(t-h)**2 + k;
}

// TODO maybe this can be better expressed with a loopback animation? (maybe not because of the place it is used in)
export function smoothPeak(t) {
    return 1.27325359122*Math.exp(-5*Math.abs(t-0.5)**1.7) - 0.27325359122;
}

// TODO maybe this can be better expressed with an animation chain? (but would that be worth it?) (maybe not because of the place it is used in)
export function popAndDisappear(t) {
    return Math.sqrt(1-(1.85*t-0.85)**2);
}

export function easeInQuad(t) {
    return t**2;
}

export function easeOutQuad(t) {
    return 1 - (1 - t)**2;
}

export function easeInCubic(t) {
    return t**3;
}

export function easeOutCubic(t) {
    return 1 - (1 - t)**3;
}

export function loopbackFunction(f) {
    return (t) => t > 0.5? f(2 - 2*t) : f(2*t);
}

export function quadMin(min) {
    const h = 0.5;
    const k = min;
    const a = (1 - k) / h**2;
    return (t) => quad(a, h, k)(t);
}
