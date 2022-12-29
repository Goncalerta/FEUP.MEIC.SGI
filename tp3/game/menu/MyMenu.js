import {CGFobject} from '../../../lib/CGF.js';

export class MyMenu extends CGFobject {
    BOX_WIDTH = 15;
    BOX_HEIGHT = 15;
    BOX_DEPTH = 1;

    constructor(scene) {
        super(scene);
    }

    getTitle() {
        throw new Error("Abstract method");
    }

    getBox() {
        throw new Error("Abstract method");
    }

    getLabels() {
        throw new Error("Abstract method");
    }

    display() {
        const halfVertical = (this.getLabels().length + this.getTitle().getFontSize() * 2) / 2;

        this.scene.pushMatrix();

        // box
        this.scene.pushMatrix();
        this.scene.scale(this.BOX_WIDTH, this.BOX_HEIGHT, this.BOX_DEPTH);
        this.box.display();
        this.scene.popMatrix();

        this.scene.translate(0, halfVertical, this.BOX_DEPTH/2.0);

        // title
        let title = this.getTitle();
        if (title != null) {
            this.getTitle().display();
            this.scene.translate(0, -1.1 * this.getTitle().getFontSize() * 2, 0);
        }

        // labels
        this.scene.pushMatrix();

        let labelledButtons = this.getLabels();
        for (let i = 0; i < labelledButtons.length; i++) {
            const labelledButton = labelledButtons[i];
            if (labelledButton != null) {
                labelledButton.display();
            }
            this.scene.translate(0, -1.1, 0);
        }
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
}
