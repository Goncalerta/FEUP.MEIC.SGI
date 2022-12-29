import { MyLabel } from "./MyLabel.js";
import { MyButton } from "./MyButton.js";

// A label with a button on the right. Optionally, a button on the left.
export class MyLabelButton extends MyLabel {
    constructor(scene, getLabelString, rightButton, colorRGBa=[0, 0, 0, 1], leftButton=null) {
        super(scene, getLabelString, colorRGBa);

        this.rightButton = rightButton;
        this.leftButton = leftButton;
    }

    display() {
        if (this.leftButton == null) {
            this.scene.translate(-MyButton.WIDTH, 0, 0);
        }

        super.display();

        this.scene.pushMatrix();

        if (this.leftButton != null) {
            this.scene.pushMatrix();
            this.scene.translate(-this.getLabelTrans() - MyButton.WIDTH, 0, 0);
            this.leftButton.display();
            this.scene.popMatrix();
        }

        this.scene.pushMatrix();
        this.scene.translate(this.getLabelTrans() + MyButton.WIDTH, 0, 0);
        this.rightButton.display();
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
}
