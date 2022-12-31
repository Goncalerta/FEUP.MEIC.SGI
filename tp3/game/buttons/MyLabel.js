import { CGFobject } from '../../../lib/CGF.js';
import { MyFont } from '../MyFont.js';

export class MyLabel extends CGFobject {
    constructor(scene, getLabelString, colorRGBa=[0, 0, 0, 1], fontSize=1) {
        super(scene);

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

    display() {
        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.font.elevated);
        this.font.writeCenteredEqualLines(this.getLabelString());
        this.scene.popMatrix();
    }
}
