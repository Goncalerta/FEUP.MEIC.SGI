import { CGFobject } from "../../../lib/CGF.js";
import { MyRectangle } from "../../MyRectangle.js";
import { getAppearance } from "../../utils.js";
import { MyLabel } from "./MyLabel.js";

export class MyTextBox extends CGFobject {
    MATERIAL = {
        shininess: 10,
        emission: [0.3, 0.24, 0.24, 1.0],
        ambient: [0.7, 0.6, 0.6, 1.0],
        diffuse: [0.9, 0.7, 0.7, 1.0],
        specular: [0.8, 0.6, 0.6, 1.0],
    };

    constructor(scene, pickingId, enableTextCallBack, startContent="", maxSize=10, colorRGBa=[0, 0, 0, 1], fontSize=1) {
        super(scene);

        this.pickingId = pickingId;
        this.enableTextCallBack = enableTextCallBack;
        this.maxSize = maxSize;
        this.content = startContent;

        this.label = new MyLabel(scene, () => { return this.content }, colorRGBa, fontSize);
        this.quad = new MyRectangle(scene, -0.5, 0.5, -0.5, 0.5);

        this.appearance = getAppearance(scene, this.MATERIAL);
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
        this.enableTextCallBack(this.write.bind(this));
    }

    display() {
        this.scene.registerForPick(this.pickingId, this);

        this.appearance.apply();

        this.scene.pushMatrix();
        this.scene.scale(this.label.getFontSize() * this.maxSize, 1, 1);
        this.quad.display();
        this.scene.popMatrix();

        this.label.display();
    }
}
