import { CGFobject } from "../../../lib/CGF.js";
import { MyButton } from "./MyButton.js";

export class MyButtonGroup extends CGFobject {
    /**
     * Get buttons in a 2D array layout.
     */
    getButtons() { throw new Error("Abstract method"); }

    display() {
        const buttons = this.getButtons();

        this.scene.pushMatrix();

        this.scene.translate(0, 1.1 * MyButton.HEIGHT, 0);
        for (let i = 0; i < buttons.length; i++) {
            const row = buttons[i];
            for (let j = 0; j < row.length; j++) {
                const button = row[j];
                if (button != null) {
                    button.display();
                }

                this.scene.translate(1.1 * MyButton.WIDTH, 0, 0);
            }
            this.scene.translate(-1.1 * MyButton.WIDTH * row.length, -1.1 * MyButton.HEIGHT, 0);
        }

        this.scene.popMatrix();
    }

}
