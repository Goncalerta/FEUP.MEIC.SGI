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
