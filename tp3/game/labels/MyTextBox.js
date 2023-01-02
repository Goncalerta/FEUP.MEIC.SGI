import { CGFobject } from "../../../lib/CGF.js";
import { MyRectangle } from "../../MyRectangle.js";
import { getAppearance } from "../../utils.js";
import { MyLabel } from "./MyLabel.js";

/**
 * MyTextBox class, representing a text box.
 */
export class MyTextBox extends CGFobject {
    MATERIAL_UNSELECTED = {
        shininess: 1,
        emission: [0.3, 0.24, 0.24, 1.0],
        ambient: [0.4, 0.4, 0.4, 1.0],
        diffuse: [0.4, 0.4, 0.4, 1.0],
        specular: [0.4, 0.4, 0.4, 1.0]
    };

    MATERIAL_SELECTED = {
        shininess: 1,
        emission: [0.3, 0.24, 0.24, 1.0],
        ambient: [0.7, 0.6, 0.6, 1.0],
        diffuse: [0.9, 0.7, 0.7, 1.0],
        specular: [0.8, 0.6, 0.6, 1.0]
    };

    MATERIAL_ERROR = {
        shininess: 1,
        emission: [1, 0.2, 0.2, 1.0],
        ambient: [1, 0.2, 0.2, 1.0],
        diffuse: [1, 0.2, 0.2, 1.0],
        specular: [1, 0.2, 0.2, 1.0]
    };

    /**
     * @constructor
     * @param {CGFscene} scene - MyScene object
     * @param {number} pickingId - Picking ID
     * @param {function} enableTextCallBack - Callback function to enable text
     * @param {CGFshader} shader - Shader to be used
     * @param {string} startContent - Initial content
     * @param {number} maxSize - Maximum size
     * @param {vec4} colorRGBa - Font color
     * @param {number} fontSize - Font size
     * @param {number} elevated - Font elevation
     */
    constructor(scene, pickingId, enableTextCallBack, shader, startContent="", maxSize=10, colorRGBa=[0, 0, 0, 1], fontSize=1, elevated=0.01) {
        super(scene);

        this.pickingId = pickingId;
        this.enableTextCallBack = enableTextCallBack;
        this.maxSize = maxSize;
        this.elevated = elevated;
        this.content = startContent;

        this.label = new MyLabel(scene, () => { return this.content }, shader, colorRGBa, fontSize);
        this.quad = new MyRectangle(scene, -0.5, 0.5, -0.5, 0.5);

        this.unselectedAppearance = getAppearance(scene, this.MATERIAL_UNSELECTED);
        this.selectedAppearance = getAppearance(scene, this.MATERIAL_SELECTED);
        this.errorAppearance = getAppearance(scene, this.MATERIAL_ERROR);

        this.error = false;
    }

    /**
     * Scales the font size.
     * @param {number} scale - Scale factor
     */
    scaleSize(scale) {
        this.label.scaleSize(scale);
    }

    /**
     * Gets the font size.
     * @returns {number} Font size
     */
    getFontSize() {
        return this.label.getFontSize();
    }

    /**
     * Gets half the text box width.
     * @returns {number} Half the text box width
     */
    getLabelTrans() {
        return this.label.getLabelTrans();
    }

    /**
     * Gets the text box content.
     * @returns {string} Text box content
     */
    getContent() {
        return this.content;
    }

    /**
     * Writes a character to the text box.
     * In case of backspace, removes the last character written, if any.
     * @param {string} char - Character to be written
     */
    write(char) {
        if (char === 'Backspace') {
            this.content = this.content.slice(0, -1);
        } else if (this.content.length < this.maxSize) {
            this.content += char;
        }
    }

    /**
     * Method called when the text box is clicked.
     * Enables text input.
     */
    onClick() {
        this.error = false;
        this.enableTextCallBack(this.write.bind(this), this.pickingId);
    }

    /**
     * Sets the text box error state.
     * @param {boolean} isError - Error state
     */
    setError(isError=true) {
        this.error = isError;
    }

    /**
     * Displays the text box.
     * @param {boolean} displayFont - Whether to display the font
     */
    display(displayFont) {
        if (displayFont) {
            this.label.display(displayFont);
        } else {
            this.scene.registerForPick(this.pickingId, this);

            if (this.error) {
                this.errorAppearance.apply();
            } else if (this.scene.selectedPickingId === this.pickingId) {
                this.selectedAppearance.apply();
            } else {
                this.unselectedAppearance.apply();
            }

            this.scene.pushMatrix();
            this.scene.translate(0, 0, this.elevated);
            this.scene.scale(this.label.getFontSize() * this.maxSize, 1, 1);
            this.quad.display();
            this.scene.popMatrix();

            this.scene.registerForPick(-1, null);
        }
    }
}
