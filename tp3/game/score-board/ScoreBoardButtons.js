import { MyButtonGroup } from "../MyButtonGroup.js";
import { MyButton } from "./MyButton.js";

export class ScoreBoardButtons extends MyButtonGroup {
    UNDO_TEXTURE_PATH = "scenes/images/game/undo.png";
    SCENARIO_TEXTURE_PATH = "scenes/images/game/scenario.png";
    EYES_TEXTURE_PATH = "scenes/images/game/eyes.png";
    PLAY_TEXTURE_PATH = "scenes/images/game/play.png";

    constructor(scene, cameras, buttonWidth, buttonHeight, buttonDepth, buttonColorRGBA) {
        super(scene, buttonWidth, buttonHeight);

        // TODO use proper callbacks
        let pickingId = 401;
        this.undoButton  = new MyButton(scene, pickingId++, () => {}, buttonWidth, buttonHeight, buttonDepth, this.UNDO_TEXTURE_PATH, buttonColorRGBA);
        this.playButton  = new MyButton(scene, pickingId++, () => {}, buttonWidth, buttonHeight, buttonDepth, this.PLAY_TEXTURE_PATH, buttonColorRGBA);
        this.scenarioButton = new MyButton(scene, pickingId++, () => { cameras.setFrontCamera() }, buttonWidth, buttonHeight, buttonDepth, this.SCENARIO_TEXTURE_PATH, buttonColorRGBA);
        this.p1POVButton = new MyButton(scene, pickingId++, () => { cameras.setPlayerCamera(1) }, buttonWidth, buttonHeight, buttonDepth, this.EYES_TEXTURE_PATH, buttonColorRGBA);
        this.p2POVButton = new MyButton(scene, pickingId++, () => { cameras.setPlayerCamera(2) }, buttonWidth, buttonHeight, buttonDepth, this.EYES_TEXTURE_PATH, buttonColorRGBA);
        // ^^
    }

    getButtons() {
        return [
            [this.playButton],
            [],
            [],
            [this.p1POVButton],
            [this.p2POVButton],
            [],
            [this.scenarioButton],
            [this.undoButton]
        ];
    }
}
