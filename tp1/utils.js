/**
 * Calculates the unit vector of the given vector
 * @param {list} vector to normalize
 */
export function normalizeVector(vector) {
    let sumSquared = 0;
    
    for (let v of vector) {
        sumSquared += v*v;
    }

    const sqrtSumSquared = Math.sqrt(sumSquared);

    let norm = [];

    for (let v of vector) {
        norm.push(v / sqrtSumSquared);
    }

    return norm;
}


/**
 * Calculates the cross product between two vectors
 * @param {list} a
 * @param {list} b
 */
export function crossProduct([a1, a2, a3], [b1, b2, b3]) {
    return [
        a2*b3 - a3*b2,
        a3*b1 - a1*b3,
        a1*b2 - a2*b1
    ];
}

/**
 * Subtracts v2 to v1: returns v1-v2
 * @param {list} v1 
 * @param {list} v2 
 */
export function subtractVectors(v1, v2) {
    if (v1 == null || v2 == null || v1.lenght != v2.lenght) {
        console.log("Subtracting invalid vectors.");
        return null;
    }

    const res = [...v1];

    for (let i = 0; i < v1.lenght; i++) {
        res[i] -= v2[i];
    }

    return res;
}
