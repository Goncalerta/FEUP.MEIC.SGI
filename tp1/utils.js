/**
 * Calculates the unit vector of the given vector
 * @param {list} vector to normalize
 */
export function normalizeVector(vector) {
    const norm = calculateNorm(vector);

    // Normalized is v divided by norm
    let normalized = [];
    for (let v of vector) {
        normalized.push(v / norm);
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
    if (v1 == null || v2 == null || v1.length != v2.length) {
        console.log("Subtracting invalid vectors.");
        return null;
    }

    const res = [...v1]; // copy v1

    // subtract by v2 element wise
    for (let i = 0; i < v1.length; i++) {
        res[i] -= v2[i];
    }

    return res;
}


/**
 * Calculates the norm of a vector
 * @param {list} vector
 */
export function calculateNorm(vector) {
    let sumSquared = 0;
    for (let v of vector) {
        sumSquared += v*v;
    }

    return Math.sqrt(sumSquared);
}


/**
 * Calculates texture coords from base coordinates according to length_s and length_t
 * @param {list} textureCoords 
 * @param {float} length_s 
 * @param {float} length_t 
 * @returns Modified texture coords
 */
export function applyLengthsToTextureCoords(textureCoords, length_s, length_t) {
    const textureCoordsCopy = [...textureCoords];

    // Divide by length_s and lenght_y accordingly
    for (let i = 0; i < textureCoords.length; i+=2) {
        textureCoordsCopy[i] /= length_s;
        textureCoordsCopy[i + 1] /= length_t;
    }

    return textureCoordsCopy;
}
