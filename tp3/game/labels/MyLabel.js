import { CGFobject } from '../../../lib/CGF.js';
import { MyFont } from './MyFont.js';

/**
 * MyLabel class, representing a text label.
 */
export class MyLabel extends CGFobject {
    /**
     * @constructor
     * @param {CGFscene} scene - MyScene object
     * @param {function} getLabelString - Function that returns the label string
     * @param {CGFshader} shader - Shader to be used
     * @param {vec4} colorRGBa - Font color
     * @param {number} fontSize - Font size
     */
    constructor(scene, getLabelString, shader, colorRGBa=[0, 0, 0, 1], fontSize=1) {
        super(scene);

        this.shader = shader;
        this.getLabelString = getLabelString;
        this.fontSize = fontSize;

        this.font = new MyFont(scene, this.fontSize, colorRGBa);
    }

    /**
     * Scales the font size.
     * @param {boolean} scale - Scale factor
     */
    scaleSize(scale) {
        this.fontSize *= scale;
        this.font.setFontSize(this.fontSize);
    }

    /**
     * Gets the font size.
     * @returns {number} Font size
     */
    getFontSize() {
        return this.fontSize;
    }

    /**
     * Gets half the label width.
     * @returns {number} Half the label width
     */
    getLabelTrans() {
        return this.font.getTransAmountCenteredEqualLines(this.getLabelString());
    }

    /**
     * Displays the label.
     * @param {boolean} displayFont - Whether to display the font
     */
    display(displayFont) {
        if (!displayFont) {
            return;
        }

        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.font.elevated);
        this.font.setShaderValues(this.shader);
        this.font.writeCenteredEqualLines(this.getLabelString(), this.shader);
        this.scene.popMatrix();
    }
}
