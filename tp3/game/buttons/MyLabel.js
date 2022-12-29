import { CGFobject } from '../../../lib/CGF.js';
import { MyFont } from '../MyFont.js';

export class MyLabel extends CGFobject {
    constructor(scene, label, colorRGBa=[0, 0, 0, 1]) {
        super(scene);

        this.label = label;

        this.font = new MyFont(scene, 1, 0.01, colorRGBa);
    }

    getLabelTrans() {
        return this.font.getTransAmountCenteredEqualLines(this.label)[0];
    }

    display() {
        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.font.elevated);
        this.font.writeCenteredEqualLines(this.label);
        this.scene.popMatrix();
    }
}
