import { MyMainMenuBox } from "./MyMainMenuBox.js";
import { MyLabelButton } from "../../buttons/MyLabelButton.js";
import { MyLabel } from "../../buttons/MyLabel.js";
import { MyButton } from "../../buttons/MyButton.js";
import { MyMenu } from "../MyMenu.js";
import { textToLimitedCentered } from "../../../utils.js";

export class MyMainMenu extends MyMenu {
    TEXT_COLOR_RGBA = [1.0, 1.0, 1.0, 1.0];
    PLAY_TEXTURE_PATH = "scenes/images/game/play.png";
    LEFT_TEXTURE_PATH = "scenes/images/game/left.png";
    RIGHT_TEXTURE_PATH = "scenes/images/game/right.png";

    constructor(scene, scenariosNames=[]) {
        super(scene);

        this.depth = 1;
        this.scenariosNames = scenariosNames;
        this.currentScenarioIndex = 0;
        this.box = new MyMainMenuBox(scene);

        let pickingId = 501;
        // TODO use proper play callback
        this.playButton  = new MyButton(scene, pickingId++, () => {}, this.PLAY_TEXTURE_PATH, this.TEXT_COLOR_RGBA);
        this.scenarioRightButton = new MyButton(scene, pickingId++, () => { this.updateScenarioIndex(1) }, this.RIGHT_TEXTURE_PATH, this.TEXT_COLOR_RGBA);
        this.scenarioLeftButton = new MyButton(scene, pickingId++, () => { this.updateScenarioIndex(-1) }, this.LEFT_TEXTURE_PATH, this.TEXT_COLOR_RGBA);

        this.chooseScenarioLabelButton = new MyLabelButton(scene, this.getCurrentScenarioName.bind(this), this.scenarioRightButton, this.TEXT_COLOR_RGBA, this.scenarioLeftButton);
        this.playLabelButton = new MyLabelButton(scene, () => { return "PLAY" }, this.playButton, this.TEXT_COLOR_RGBA, this.playButton2);

        this.title = new MyLabel(this.scene, () => { return "CHECKERS" }, this.TEXT_COLOR_RGBA, 1.5);
        this.scenarioLabel = new MyLabel(this.scene, () => { return "SCENARIO" }, this.TEXT_COLOR_RGBA);

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

    getCurrentScenarioName() {
        if (this.scenariosNames.length == 0) {
            return " ? ";
        }

        return textToLimitedCentered(this.scenariosNames[this.currentScenarioIndex], 5);
    }

    updateScenarioIndex(delta) {
        if (this.scenariosNames.length == 0) {
            return;
        }

        if (this.currentScenarioIndex + delta < 0) {
            this.currentScenarioIndex = this.scenariosNames.length;
        }

        this.currentScenarioIndex = (this.currentScenarioIndex + delta) % this.scenariosNames.length;
    }
}
