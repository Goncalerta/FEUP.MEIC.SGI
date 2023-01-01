import { MyLabelButton } from "../buttons/MyLabelButton.js";
import { MyLabel } from "../buttons/MyLabel.js";
import { MyButton } from "../buttons/MyButton.js";
import { Dimensions, MyMenu } from "./MyMenu.js";
import { textToLimitedCentered, removeFileExtension } from "../../utils.js";
import { MyTextBox } from "../buttons/MyTextBox.js";
import { Player } from "../Player.js";
import { CONFIG } from "../config.js";

export class MyMainMenu extends MyMenu {
    TEXT_COLOR_RGBA = [1.0, 1.0, 1.0, 1.0];
    PLAY_TEXTURE_PATH = "scenes/images/game/play.png";
    LEFT_TEXTURE_PATH = "scenes/images/game/left.png";
    RIGHT_TEXTURE_PATH = "scenes/images/game/right.png";

    constructor(scene, enableTextCallBack, playCallBack=(scenarioFileName, player1Name, player2Name) => {}) {
        super(scene);

        this.depth = 1;
        this.scenariosNames = CONFIG.scenes;
        this.currentScenarioIndex = 0;

        let pickingId = 501;

        // TextBoxes to player names
        this.player1Label = new MyLabel(this.scene, () => { return "PLAYER1" }, this.TEXT_COLOR_RGBA);
        this.player1NameTextBox = new MyTextBox(scene, pickingId++, enableTextCallBack, Player.PLAYER_1_DEFAULT_NAME, Player.PLAYER_LENGTH);
        this.player2Label = new MyLabel(this.scene, () => { return "PLAYER2" }, this.TEXT_COLOR_RGBA);
        this.player2NameTextBox = new MyTextBox(scene, pickingId++, enableTextCallBack, Player.PLAYER_2_DEFAULT_NAME, Player.PLAYER_LENGTH);

        // Buttons
        this.playButton  = new MyButton(scene, pickingId++, () => { playCallBack(this.getCurrentScenarioFileName(), this.player1NameTextBox.getContent(), this.player2NameTextBox.getContent()) }, this.PLAY_TEXTURE_PATH, this.TEXT_COLOR_RGBA);
        this.scenarioRightButton = new MyButton(scene, pickingId++, () => { this.updateScenarioIndex(1) }, this.RIGHT_TEXTURE_PATH, this.TEXT_COLOR_RGBA);
        this.scenarioLeftButton = new MyButton(scene, pickingId++, () => { this.updateScenarioIndex(-1) }, this.LEFT_TEXTURE_PATH, this.TEXT_COLOR_RGBA);

        this.chooseScenarioLabelButton = new MyLabelButton(scene, this.getCurrentScenarioName.bind(this), this.scenarioRightButton, this.TEXT_COLOR_RGBA, this.scenarioLeftButton);
        this.playLabelButton = new MyLabelButton(scene, () => { return "PLAY" }, this.playButton, this.TEXT_COLOR_RGBA, this.playButton2);

        this.title = new MyLabel(this.scene, () => { return "CHECKERS" }, this.TEXT_COLOR_RGBA, 1.5);
        this.scenarioLabel = new MyLabel(this.scene, () => { return "SCENARIO" }, this.TEXT_COLOR_RGBA);
    }

    getDimensions() {
        return new Dimensions(15, 15, 1);
    }

    getTitle() {
        return this.title;
    }

    getLabels() {
        return [
            this.scenarioLabel,
            this.chooseScenarioLabelButton,
            null,
            this.player1Label,
            this.player1NameTextBox,
            null,
            this.player2Label,
            this.player2NameTextBox,
            null,
            this.playLabelButton
        ];
    }

    getCurrentScenarioFileName() {
        if (this.scenariosNames.length == 0) {
            return null;
        }

        return this.scenariosNames[this.currentScenarioIndex];
    }

    getCurrentScenarioName() {
        if (this.scenariosNames.length == 0) {
            return " ? ";
        }

        return textToLimitedCentered(removeFileExtension(this.scenariosNames[this.currentScenarioIndex]), 5);
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
