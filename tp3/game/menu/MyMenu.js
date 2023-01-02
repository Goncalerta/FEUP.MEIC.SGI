import {CGFobject,CGFshader} from '../../../lib/CGF.js';
import { MyMenuBox } from './MyMenuBox.js';

/**
 * MyMenu class, representing a generic menu.
 * A menu is composed of a box, a title and a list of labels.
 * The labels must have the same font size.
 */
export class MyMenu extends CGFobject {
    /**
     * @constructor
     * @param {CGFscene} scene - MyScene object
     */
    constructor(scene) {
        super(scene);

        this.box = new MyMenuBox(scene);
        this.transparentShader = new CGFshader(scene.gl, "shaders/transparent.vert", "shaders/transparent.frag");
    }

    /**
     * Gets the shader to be used.
     * @returns {CGFshader} Shader
     */
    getShader() {
        return this.transparentShader;
    }

    /**
     * Gets the box dimensions.
     * @returns {Dimensions} Box dimensions
     */
    getDimensions() {
        throw new Error("Abstract method");
    }

    /**
     * Gets the scale factor to be used to fit the title and labels in the box.
     * @returns {number} Scale factor
     */
    getScaleFactor() {
        const boxDimensions = this.getDimensions();
        const textWidth = this.getLabels().reduce((acc, label) => {
            if (label == null) {
                return acc;
            }

            return Math.max(acc, label.getLabelTrans() * 2);
        }, 0);

        const fontSize = this.getLabels().length == 0 ? 1 : this.getLabels()[0].getFontSize();

        const textHeight = 1.1 * (this.getTitle() == null ? 0 : this.getTitle().getFontSize() + fontSize * this.getLabels().length);

        return 1.2 * Math.max(textWidth / boxDimensions.width, textHeight / boxDimensions.height);
    }

    /**
     * Gets the title of the menu.
     * @returns {MyLabel} Title
     */
    getTitle() {
        return null;
    }

    /**
     * Gets the labels of the menu.
     * Labels must have the same font size.
     * @returns {MyLabel[]} Labels
     */
    getLabels() {
        throw new Error("Abstract method");
    }

    /**
     * Scales the title and labels.
     * @param {number} scale - Scale factor
     */
    scaleTitleAndLabels(scale) {
        const title = this.getTitle();
        if (title != null) {
            title.scaleSize(scale);
        }

        const labels = this.getLabels();
        for (let i = 0; i < labels.length; i++) {
            if (labels[i] != null) {
                labels[i].scaleSize(scale);
            }
        }
    }

    /**
     * Displays the menu.
     * @param {boolean} displayFont - Whether to display the font or not
     */
    displayBase(displayFont) {
        this.scaleTitleAndLabels(this.getScaleFactor());

        const dimensions = this.getDimensions();
        const title = this.getTitle();
        const labels = this.getLabels();

        let fontSize = labels.length == 0 ? 1 : labels[0].getFontSize();

        let halfVertical = this.getLabels().length * fontSize / 2;

        if (title != null) {
            halfVertical += title.getFontSize();
        }

        this.scene.pushMatrix();

        // box
        if (!displayFont) {
            this.scene.pushMatrix();
            this.scene.scale(dimensions.width, dimensions.height, dimensions.depth);
            this.box.display();
            this.scene.popMatrix();
        }

        this.scene.translate(0, halfVertical, dimensions.depth/2.0);

        // title
        if (title != null) {
            title.display(displayFont);
            this.scene.translate(0, -1.1 * title.getFontSize() * 2, 0);
        }

        // labels
        this.scene.pushMatrix();
        
        for (let i = 0; i < labels.length; i++) {
            const label = labels[i];
            if (label !== null) {
                fontSize = label.getFontSize();
                label.display(displayFont);
            }
            this.scene.translate(0, -1.1 * fontSize, 0);
        }
        this.scene.popMatrix();

        this.scene.popMatrix();

        this.scaleTitleAndLabels(1 / this.getScaleFactor());
    }

    /**
     * Displays the menu.
     * @param {boolean} pickMode - Whether to display the menu in pick mode or not
     */
    display(pickMode) {
        this.displayBase(false);
        if (!pickMode) {
            this.scene.setActiveShaderSimple(this.transparentShader);
            this.displayBase(true);
            this.scene.setActiveShaderSimple(this.scene.defaultShader);
        }
    }
}


/**
 * Dimensions class, representing the dimensions of a box.
 */
export class Dimensions {
    /**
     * @constructor
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {number} depth - Depth
     */
    constructor(width, height, depth) {
        this.width = width;
        this.height = height;
        this.depth = depth;
    }
}
