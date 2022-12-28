import { CGFobject } from "../../lib/CGF.js";

export class MyButtonGroup extends CGFobject {
    constructor(scene, buttonWidth, buttonHeight) {
        super(scene);

        this.buttonWidth = buttonWidth;
        this.buttonHeight = buttonHeight;
    }

    /**
     * Get buttons in a 2D array layout.
     */
    getButtons() { throw new Error("Abstract method"); }

    display() {
        const buttons = this.getButtons();

        this.scene.pushMatrix();

        this.scene.translate(0, 1.1 * this.buttonHeight, 0);
        for (let i = 0; i < buttons.length; i++) {
            const row = buttons[i];
            for (let j = 0; j < row.length; j++) {
                const button = row[j];
                if (button != null) {
                    button.display();
                }

                this.scene.translate(1.1 * this.buttonWidth, 0, 0);
            }
            this.scene.translate(-1.1 * this.buttonWidth * row.length, -1.1 * this.buttonHeight, 0);
        }

        this.scene.popMatrix();
    }

}
