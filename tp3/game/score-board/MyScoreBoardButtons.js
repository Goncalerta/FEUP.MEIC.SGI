import { MyButtonGroup } from "../buttons/MyButtonGroup.js";
import { MyButton } from "../buttons/MyButton.js";

export class MyScoreBoardButtons extends MyButtonGroup {
    UNDO_TEXTURE_PATH = "scenes/images/game/undo.png";
    SCENARIO_TEXTURE_PATH = "scenes/images/game/scenario.png";
    EYES_TEXTURE_PATH = "scenes/images/game/eyes.png";
    PLAY_TEXTURE_PATH = "scenes/images/game/play.png";

    constructor(scene, cameras, buttonColorRGBA) {
        super(scene);

        // TODO use proper callbacks
        let pickingId = 401;
        this.undoButton  = new MyButton(scene, pickingId++, () => {}, this.UNDO_TEXTURE_PATH, buttonColorRGBA);
        this.playButton  = new MyButton(scene, pickingId++, () => {}, this.PLAY_TEXTURE_PATH, buttonColorRGBA);
        this.scenarioButton = new MyButton(scene, pickingId++, () => { cameras.setFrontCamera() }, this.SCENARIO_TEXTURE_PATH, buttonColorRGBA);
        this.p1POVButton = new MyButton(scene, pickingId++, () => { cameras.setPlayerCamera(1) }, this.EYES_TEXTURE_PATH, buttonColorRGBA);
        this.p2POVButton = new MyButton(scene, pickingId++, () => { cameras.setPlayerCamera(2) }, this.EYES_TEXTURE_PATH, buttonColorRGBA);
        // ^^
    }

    getButtons() {
        return [
            [this.scenarioButton],
            [],
            [],
            [this.p1POVButton],
            [this.p2POVButton],
            [],
            [this.undoButton],
            [this.playButton]
        ];
    }
}
