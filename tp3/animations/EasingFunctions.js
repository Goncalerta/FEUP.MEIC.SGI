export function identity(t) {
    return t;
}

export function smoothPeak(t) {
    return 1.27325359122*Math.exp(-5*Math.abs(t-0.5)**1.7) - 0.27325359122;
}

export function popAndDisappear(t) {
    return Math.sqrt(1-(1.85*t-0.85)**2);
}

export function easeOutCubic(t) {
    return 1 - (1 - t)**3;
}

export function easeInCubic(t) {
    return t**3;
}

export function loopbackFunction(f) {
    return (t) => t > 0.5? f(2 - 2*t) : f(2*t);
}

export function accelDecel(accel, between, deccel, xRatio, yRatio) {
    const inbetweenXRatio = 1 - 2 * xRatio;
    const inbetweenYRatio = 1 - 2 * yRatio;
    return (t) => {
        if (t <= xRatio) {
            console.log('1', t, xRatio, yRatio, accel(t / xRatio) * yRatio);
            return accel(t / xRatio) * yRatio;
        } else if (t < 1 - xRatio) {
            console.log('2', t, xRatio, yRatio, between((t - xRatio) / inbetweenXRatio) * inbetweenYRatio);
            return yRatio + between((t - xRatio) / inbetweenXRatio) * inbetweenYRatio;
        } else {
            console.log('3', t, xRatio, yRatio, 1 - yRatio + deccel((t - 1 + xRatio) / xRatio) * yRatio);
            return 1 - yRatio + deccel((t - 1 + xRatio) / xRatio) * yRatio;
        }
    };
}
