import { MyMainMenuBox } from "./MyMainMenuBox.js";
import { MyLabelButton } from "../../buttons/MyLabelButton.js";
import { MyLabel } from "../../buttons/MyLabel.js";
import { MyButton } from "../../buttons/MyButton.js";
import { MyMenu } from "../MyMenu.js";

export class MyMainMenu extends MyMenu {
    TEXT_COLOR_RGBA = [1.0, 1.0, 1.0, 1.0];
    PLAY_TEXTURE_PATH = "scenes/images/game/play.png";
    LEFT_TEXTURE_PATH = "scenes/images/game/left.png";
    RIGHT_TEXTURE_PATH = "scenes/images/game/right.png";

    constructor(scene) {
        super(scene);

        this.depth = 1;
        this.box = new MyMainMenuBox(scene);

        let pickingId = 501;
        this.playButton  = new MyButton(scene, pickingId++, () => {}, this.PLAY_TEXTURE_PATH, this.TEXT_COLOR_RGBA);
        this.scenarioRightButton = new MyButton(scene, pickingId++, () => {}, this.RIGHT_TEXTURE_PATH, this.TEXT_COLOR_RGBA);
        this.scenarioLeftButton = new MyButton(scene, pickingId++, () => {}, this.LEFT_TEXTURE_PATH, this.TEXT_COLOR_RGBA);

        // TODO implement label with callback so that it can be updated when a button is pressed
        this.chooseScenarioLabelButton = new MyLabelButton(scene, "TODO", this.scenarioRightButton, this.TEXT_COLOR_RGBA, this.scenarioLeftButton);
        this.playLabelButton = new MyLabelButton(scene, "PLAY", this.playButton, this.TEXT_COLOR_RGBA, this.playButton2);

        this.title = new MyLabel(this.scene, "CHECKERS", this.TEXT_COLOR_RGBA, 1.5);
        this.scenarioLabel = new MyLabel(this.scene, "SCENARIO", this.TEXT_COLOR_RGBA);

        // TODO text box to insert player names (?)
    }

    getTitle() {
        return this.title;
    }

    getBox() {
        return this.box;
    }

    getLabels() {
        return [
            this.scenarioLabel,
            this.chooseScenarioLabelButton,
            null,
            this.playLabelButton
        ];
    }
}
