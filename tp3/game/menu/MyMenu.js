import {CGFobject,CGFshader} from '../../../lib/CGF.js';
import { MyMenuBox } from './MyMenuBox.js';

export class MyMenu extends CGFobject {
    constructor(scene) {
        super(scene);

        this.box = new MyMenuBox(scene);
        this.transparentShader = new CGFshader(scene.gl, "shaders/transparent.vert", "shaders/transparent.frag");
    }

    getShader() {
        return this.transparentShader;
    }

    getDimensions() {
        throw new Error("Abstract method");
    }

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

    getTitle() {
        return null;
    }

    /**
     * Gets the labels of the menu.
     * Labels must have the same font size.
     */
    getLabels() {
        throw new Error("Abstract method");
    }

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

    displayBox() {
        const dimensions = this.getDimensions();
        
        // box
        this.scene.pushMatrix();
        this.scene.scale(dimensions.width, dimensions.height, dimensions.depth);
        this.box.display();
        this.scene.popMatrix();
    }

    displayText() {
        const dimensions = this.getDimensions();

        this.scaleTitleAndLabels(this.getScaleFactor());
        const title = this.getTitle();
        const labels = this.getLabels();

        let fontSize = labels.length == 0 ? 1 : labels[0].getFontSize();

        let halfVertical = this.getLabels().length * fontSize / 2;

        if (title != null) {
            halfVertical += title.getFontSize();
        }

        this.scene.pushMatrix();

        this.scene.translate(0, halfVertical, dimensions.depth/2.0);

        // title
        if (title != null) {
            title.display(true);
            this.scene.translate(0, -1.1 * title.getFontSize() * 2, 0);
        }

        // labels
        
        for (let i = 0; i < labels.length; i++) {
            const label = labels[i];
            if (label !== null) {
                fontSize = label.getFontSize();
                label.display(true);
            }
            this.scene.translate(0, -1.1 * fontSize, 0);
        }

        this.scene.popMatrix();

        this.scaleTitleAndLabels(1 / this.getScaleFactor());
    }

    display(pickMode) {
        this.displayBox();
        if (!pickMode) {
            this.scene.setActiveShaderSimple(this.transparentShader);
            this.displayText();
            this.scene.setActiveShaderSimple(this.scene.defaultShader);
        }
    }
}

export class Dimensions {
    constructor(width, height, depth) {
        this.width = width;
        this.height = height;
        this.depth = depth;
    }
}
