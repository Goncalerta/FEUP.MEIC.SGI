import { MyLabel } from "./MyLabel.js";
import { MyButton } from "./MyButton.js";

// A label with a button on the right. Optionally, a button on the left.
export class MyLabelButton extends MyLabel {
    constructor(scene, getLabelString, rightButton, colorRGBa=[0, 0, 0, 1], leftButton=null, fontSize=1) {
        super(scene, getLabelString, colorRGBa, fontSize);

        this.rightButton = rightButton;
        this.leftButton = leftButton;
    }

    getLabelTrans() {
        let labelTrans = super.getLabelTrans();

        if (this.leftButton != null) {
            labelTrans += MyButton.WIDTH/2 * this.fontSize;
        }

        labelTrans += MyButton.WIDTH/2 * this.fontSize;

        return labelTrans;
    }

    display() {
        this.scene.pushMatrix();
        if (this.leftButton == null) {
            this.scene.translate(-MyButton.WIDTH /2 * this.fontSize, 0, 0);
        }

        super.display();

        if (this.leftButton != null) {
            this.scene.pushMatrix();
            this.scene.translate(-super.getLabelTrans() - MyButton.WIDTH/2 * this.fontSize, 0, 0);
            this.scene.scale(this.fontSize, this.fontSize, this.fontSize);
            this.leftButton.display();
            this.scene.popMatrix();
        }

        this.scene.pushMatrix();
        this.scene.translate(super.getLabelTrans() + MyButton.WIDTH/2 * this.fontSize, 0, 0);
        this.scene.scale(this.fontSize, this.fontSize, this.fontSize);
        this.rightButton.display();
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
}
