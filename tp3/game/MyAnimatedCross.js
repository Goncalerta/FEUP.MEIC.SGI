import { MyCross } from "../MyCross.js";
import { EventAnimation } from "../animations/EventAnimation.js";
import { identity, popAndDisappear, smoothPeak } from "../animations/EasingFunctions.js";
import { getAppearance, interpolate } from "../utils.js";

/**
 * MyRectangle class, representing a rectangle in XY plane.
 */
export class MyAnimatedCross {
    MATERIAL = {
        shininess: 5,
        emission: [0.8, 0.05, 0.01, 1.0],
        ambient: [0.1, 0, 0, 1.0],
        diffuse: [0, 0, 0, 1.0],
        specular: [0, 0, 0, 1.0],
    };

    MATERIAL_GLOW = {
        shininess: 5,
        emission: [1.0, 0.5, 0.5, 1.0],
        ambient: [0.2, 0.2, 0.2, 1.0],
        diffuse: [0.05, 0.05, 0.05, 1.0],
        specular: [0, 0, 0, 1.0],
    };

    /**
     * @constructor
     * @param scene Reference to MyScene object.
     * @param x1 x coordinate of first point.
     * @param x2 x coordinate of second point.
     * @param y1 y coordinate of first point.
     * @param y2 y coordinate of second point.
     */
    constructor(scene, x, y, tileSize, onEnd, height = 0.01, stroke = 0.2, duration = 1) {
        this.scene = scene;
        this.tileSize = tileSize;
        this.position = [(x-3.5)*this.tileSize, height, -(y-3.5)*this.tileSize];
        this.cross = new MyCross(scene, stroke);
        this.animation = new EventAnimation(scene, duration, [smoothPeak, popAndDisappear], onEnd);
    }

    start(t) {
        this.animation.start(t);
    }

    display() {
        const [tColor, tSize] = this.animation.get();

        getAppearance(this.scene, interpolate(this.MATERIAL, this.MATERIAL_GLOW, tColor)).apply();

        this.scene.pushMatrix();
        this.scene.translate(...this.position);
        this.scene.rotate(Math.PI / 4, 0, 1, 0);
        this.scene.scale(this.tileSize*tSize, 0, this.tileSize*tSize);
        this.cross.display();
        this.scene.popMatrix();
    }
}
