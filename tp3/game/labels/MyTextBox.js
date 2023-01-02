import { CGFobject } from "../../../lib/CGF.js";
import { MyRectangle } from "../../MyRectangle.js";
import { getAppearance } from "../../utils.js";
import { MyLabel } from "./MyLabel.js";

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

    constructor(scene, pickingId, enableTextCallBack, shader, startContent="", maxSize=10, colorRGBa=[0, 0, 0, 1], fontSize=1, elevated=0.01) {
        super(scene);

        this.pickingId = pickingId;
        this.enableTextCallBack = enableTextCallBack;
        this.maxSize = maxSize;
        this.elevated = elevated;
        this.content = startContent;

        this.label = new MyLabel(scene, () => { return this.content }, shader, colorRGBa, fontSize); // TODO is there a way to make this class extend MyLabel passing a method (with the content) to the super constructor?
        this.quad = new MyRectangle(scene, -0.5, 0.5, -0.5, 0.5);

        this.unselectedAppearance = getAppearance(scene, this.MATERIAL_UNSELECTED);
        this.selectedAppearance = getAppearance(scene, this.MATERIAL_SELECTED);
        this.errorAppearance = getAppearance(scene, this.MATERIAL_ERROR);

        this.error = false;
    }

    scaleSize(scale) {
        this.label.scaleSize(scale);
    }

    getFontSize() {
        return this.label.getFontSize();
    }

    getLabelTrans() {
        return this.label.getLabelTrans();
    }

    getContent() {
        return this.content;
    }

    write(char) {
        if (char === 'Backspace') {
            this.content = this.content.slice(0, -1);
        } else if (this.content.length < this.maxSize) {
            this.content += char;
        }
    }

    onClick() {
        this.error = false;
        this.enableTextCallBack(this.write.bind(this), this.pickingId);
    }

    setError(isError=true) {
        this.error = isError;
    }

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
