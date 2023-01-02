import { CGFobject } from '../../../lib/CGF.js';
import { MyFont } from './MyFont.js';

export class MyLabel extends CGFobject {
    constructor(scene, getLabelString, shader, colorRGBa=[0, 0, 0, 1], fontSize=1) {
        super(scene);

        this.shader = shader;
        this.getLabelString = getLabelString;
        this.fontSize = fontSize;

        this.font = new MyFont(scene, this.fontSize, colorRGBa);
    }

    scaleSize(scale) {
        this.fontSize *= scale;
        this.font.setFontSize(this.fontSize);
    }

    getFontSize() {
        return this.fontSize;
    }

    getLabelTrans() {
        return this.font.getTransAmountCenteredEqualLines(this.getLabelString());
    }

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
