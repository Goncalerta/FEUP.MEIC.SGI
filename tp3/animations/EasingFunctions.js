export function identity(t) {
    return t;
}

export function smoothPeak(t) {
    return 1.27325359122*Math.exp(-5*Math.abs(t-0.5)**1.7) - 0.27325359122;
}

export function popAndDisappear(t) {
    return Math.sqrt(1-(1.85*t-0.85)**2);
}
