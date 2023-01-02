import { CGFobject } from "../lib/CGF.js";
import { MyRectangle } from "./MyRectangle.js";

/**
 * MyBox class, representing a box.
 */
export class MyBox extends CGFobject {
    /**
     * @constructor
     * @param {CGFscene} scene - MyScene object
     * @param {CGFappearance} appearance - Box appearance
     */
    constructor(scene, appearance=null) {
        super(scene);

        this.appearance = appearance;

        this.quad = new MyRectangle(scene, -0.5, 0.5, -0.5, 0.5);
    }

    /**
     * Displays the box.
     */
    display() {
        if (this.appearance) this.appearance.apply();

        // top
        this.scene.pushMatrix();
        this.scene.translate(0, 0.5, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.quad.display();
        this.scene.popMatrix();

        // bottom
        this.scene.pushMatrix();
        this.scene.translate(0, -0.5, 0);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.quad.display();
        this.scene.popMatrix();

        // left
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.5);
        this.quad.display();
        this.scene.popMatrix();

        // right
        this.scene.pushMatrix();
        this.scene.translate(0, 0, -0.5);
        this.scene.rotate(Math.PI, 1, 0, 0);
        this.quad.display();
        this.scene.popMatrix();

        // front
        this.scene.pushMatrix();
        this.scene.translate(0.5, 0, 0);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();

        // back
        this.scene.pushMatrix();
        this.scene.translate(-0.5, 0, 0);
        this.scene.rotate(-Math.PI / 2, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();
    }
}
