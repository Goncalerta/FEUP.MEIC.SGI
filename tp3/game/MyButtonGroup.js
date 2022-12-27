import { CGFobject } from "../../lib/CGF.js";
import { MyButton } from "./MyButton.js";

export class MyButtonGroup extends CGFobject {
    UNDO_TEXTURE_PATH = "scenes/images/game/undo.png";
    REDO_TEXTURE_PATH = "scenes/images/game/redo.png";
    SCENARIO_TEXTURE_PATH = "scenes/images/game/scenario.png";
    P1_SCENARIO_TEXTURE_PATH = "scenes/images/game/p1_scenario.png";
    P2_SCENARIO_TEXTURE_PATH = "scenes/images/game/p2_scenario.png";
    PLAY_TEXTURE_PATH = "scenes/images/game/play.png";

    constructor(scene, cameras, buttonWidth, buttonHeight, buttonDepth, buttonColorRGBA) {
        super(scene);

        this.buttonWidth = buttonWidth;
        this.buttonHeight = buttonHeight;
        
        // TODO use proper callbacks
        let pickingId = 401;
        this.undoButton  = new MyButton(scene, pickingId++, () => {}, buttonWidth, buttonHeight, buttonDepth, this.UNDO_TEXTURE_PATH, buttonColorRGBA);
        this.redoButton  = new MyButton(scene, pickingId++, () => {}, buttonWidth, buttonHeight, buttonDepth, this.REDO_TEXTURE_PATH, buttonColorRGBA);
        this.playButton  = new MyButton(scene, pickingId++, () => {}, buttonWidth, buttonHeight, buttonDepth, this.PLAY_TEXTURE_PATH, buttonColorRGBA);
        // ^^
        this.povButton   = new MyButton(scene, pickingId++, () => { cameras.setFrontCamera() }, buttonWidth, buttonHeight, buttonDepth, this.SCENARIO_TEXTURE_PATH, buttonColorRGBA);
        this.p1PovButton = new MyButton(scene, pickingId++, () => { cameras.setPlayerCamera(1) }, buttonWidth, buttonHeight, buttonDepth, this.P1_SCENARIO_TEXTURE_PATH, buttonColorRGBA);
        this.p2PovButton = new MyButton(scene, pickingId++, () => { cameras.setPlayerCamera(2) }, buttonWidth, buttonHeight, buttonDepth, this.P2_SCENARIO_TEXTURE_PATH, buttonColorRGBA);

        this.buttons = [
            [this.povButton, this.playButton],
            [this.undoButton, this.redoButton],
            [this.p1PovButton, this.p2PovButton]
        ];
    }

    display() {
        this.scene.pushMatrix();

        this.scene.translate(0, 1.1 * this.buttonHeight, 0);
        for (let i = 0; i < this.buttons.length; i++) {
            const row = this.buttons[i];
            for (let j = 0; j < row.length; j++) {
                const button = row[j];
                button.display();
                this.scene.translate(1.1 * this.buttonWidth, 0, 0);
            }
            this.scene.translate(-1.1 * this.buttonWidth * row.length, -1.1 * this.buttonHeight, 0);
        }

        this.scene.popMatrix();
    }
}
