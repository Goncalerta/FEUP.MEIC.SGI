import { CGFappearance, CGFcamera } from "../lib/CGF.js";

/**
 * Calculates the unit vector of the given vector
 * @param {list} vector to normalize
 */
export function normalizeVector(vector) {
    const norm = calculateNorm(vector);

    // Normalized is v divided by norm
    const normalized = [];
    for (const v of vector) {
        normalized.push(v / norm);
    }

    return normalized;
}

/**
 * Calculates the cross product between two vectors
 * @param {list} a
 * @param {list} b
 */
export function crossProduct([a1, a2, a3], [b1, b2, b3]) {
    return [a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1];
}

/**
 * Subtracts v2 to v1: returns v1-v2
 * @param {list} v1
 * @param {list} v2
 */
export function subtractVectors(v1, v2) {
    if (v1 == null || v2 == null || v1.length != v2.length) {
        console.log('Subtracting invalid vectors.');
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
    for (const v of vector) {
        sumSquared += v * v;
    }

    return Math.sqrt(sumSquared);
}

/**
 * Calculates texture coords from base coordinates according to length_s and length_t
 * @param {list} textureCoords
 * @param {float} lengthS
 * @param {float} lengthT
 * @return Modified texture coords
 */
export function applyLengthsToTextureCoords(textureCoords, lengthS, lengthT) {
    const textureCoordsCopy = [...textureCoords];

    // Divide by length_s and lenght_y accordingly
    for (let i = 0; i < textureCoords.length; i += 2) {
        textureCoordsCopy[i] /= lengthS;
        textureCoordsCopy[i + 1] /= lengthT;
    }

    return textureCoordsCopy;
}

export function getAppearance(scene, material, texture=null) {
    const appearance = new CGFappearance(scene);
    appearance.setEmission(...material.emission);
    appearance.setAmbient(...material.ambient);
    appearance.setDiffuse(...material.diffuse);
    appearance.setSpecular(...material.specular);
    appearance.setShininess(material.shininess);
    if (texture != null) {
        appearance.setTexture(texture);
    }
    return appearance;
}

export function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

export function interpolate(o1, o2, t) {
    if (typeof o1 === 'number') {
        return o1 + (o2 - o1) * t;
    } else if (Array.isArray(o1)) {
        const o = [];
        for (let i = 0; i < o1.length; i++) {
            o.push(interpolate(o1[i], o2[i], t));
        }
        return o;
    } else if (o1 instanceof CGFcamera) {
        const fov = interpolate(o1.fov, o2.fov, t);
        const near = interpolate(o1.near, o2.near, t);
        const far = interpolate(o1.far, o2.far, t);
        const position = interpolate(o1.position, o2.position, t);
        const target = interpolate(o1.target, o2.target, t);
        return new CGFcamera(fov, near, far, position, target);
    } else if (typeof o1 === 'object') {
        const o = {};
        for (const key in o1) {
            if (o1.hasOwnProperty(key)) {
                o[key] = interpolate(o1[key], o2[key], t);
            }
        }
        return o;
    }
}

export function secondsToFormattedTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
}
