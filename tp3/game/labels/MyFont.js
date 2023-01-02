import { MyRectangle } from "../../MyRectangle.js";
import { CGFtexture } from "../../../lib/CGF.js";
import { getAppearance } from '../../utils.js';

/**
 * MyFont class, representing a text font.
 */
export class MyFont {
    TEXTURE_PATH = "scenes/images/game/oolite-font.trans.png";
    MATERIAL = {
        shininess: 1,
        emission: [0, 0, 0, 1.0],
        ambient: [0, 0, 0, 1.0],
        diffuse: [0, 0, 0, 1.0],
        specular: [0, 0, 0, 1.0],
    };

    /**
     * @constructor
     * @param {CGFscene} scene - MyScene object
     * @param {number} fontSize - Font size
     * @param {vec4} colorRGBa - Font color
     * @param {number} elevated - Font elevation
     */
    constructor(scene, fontSize=1, colorRGBa=[0,0,0,1], elevated=0.01) {
        this.scene = scene;
        
        this.fontSize = fontSize;
        this.colorRGBa = colorRGBa;

        this.quad = new MyRectangle(scene, -0.5, 0.5, -0.5, 0.5);
        this.texture = new CGFtexture(scene, this.TEXTURE_PATH);
        this.appearance = getAppearance(scene, this.MATERIAL, this.texture);

        this.elevated = elevated;
    }

    /**
     * Sets the shader values for the font.
     * @param {CGFshader} shader - Shader to be used
     */
    setShaderValues(shader) {
        shader.setUniformsValues({
            dims: [16, 16],
            colorRGBa: this.colorRGBa
        });
    }

    /**
     * Sets the font size.
     * @param {number} fontSize - Font size
     */
    setFontSize(fontSize) {
        this.fontSize = fontSize;
    }

    /**
     * Writes a character.
     * @param {string} char - Character to be written
     * @param {CGFshader} shader - Shader to be used
     */
    writeChar(char, shader) {
        const charCode = char.charCodeAt(0);
        const charX = charCode % 16;
        const charY = Math.floor(charCode / 16);
        shader.setUniformsValues({
            charCoords: [charX, charY]
        });

        this.scene.pushMatrix();
        this.scene.scale(this.fontSize, this.fontSize, 1);
        this.quad.display();
        this.scene.popMatrix();
    }

    /**
     * Writes a string centered.
     * @param {string} stringToDisplay - String to be written
     * @param {CGFshader} shader - Shader to be used
     */
    writeCenteredEqualLines(stringToDisplay, shader) {
        const lines = stringToDisplay.split('\n');
        const numLines = lines.length;

        this.appearance.apply();
        this.scene.pushMatrix();

        this.scene.translate(0.5 * this.fontSize, (numLines/2.0 - 0.5) * this.fontSize, this.elevated);

        for (let i = 0; i < numLines; i++) {
            const line = lines[i];
            const lineLength = line.length;
            const transCenter = lineLength/2.0 * this.fontSize;

            // center line
            this.scene.translate(-transCenter, 0, 0);

            for (let j = 0; j < lineLength; j++) {
                this.writeChar(line[j], shader);
                this.scene.translate(this.fontSize, 0, 0);
            }

            // center line
            this.scene.translate(-transCenter, -this.fontSize, 0);
        }

        this.scene.popMatrix();
    }

    /**
     * Gets the translation amount to center the string.
     * @param {string} stringToDisplay - String to be written
     * @returns {number} Translation amount
     */
    getTransAmountCenteredEqualLines(stringToDisplay) {
        return Math.max(0, ...stringToDisplay.split('\n').map(line => line.length/2.0 * this.fontSize));
    }
}
