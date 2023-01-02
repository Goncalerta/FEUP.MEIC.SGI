import { MyLabelButton } from "../labels/MyLabelButton.js";
import { MyLabel } from "../labels/MyLabel.js";
import { MyButton } from "../labels/MyButton.js";
import { Dimensions, MyMenu } from "./MyMenu.js";
import { textToLimitedCentered, removeFileExtension, isOnlyWhiteSpaces } from "../../utils.js";
import { MyTextBox } from "../labels/MyTextBox.js";
import { Player } from "../Player.js";
import { CONFIG } from "../config.js";

/**
 * MyMainMenu class, representing the main menu of the game.
 */
export class MyMainMenu extends MyMenu {
    TEXT_COLOR_RGBA = [1.0, 1.0, 1.0, 1.0];
    PLAY_TEXTURE_PATH = "scenes/images/game/play.png";
    LEFT_TEXTURE_PATH = "scenes/images/game/left.png";
    RIGHT_TEXTURE_PATH = "scenes/images/game/right.png";

    /**
     * @constructor
     * @param {CGFscene} scene - MyScene object
     * @param {function} enableTextCallBack - Callback function to enable text
     * @param {function} playCallBack - Callback function to start the game
     */
    constructor(scene, enableTextCallBack, playCallBack=(scenarioFileName, player1Name, player2Name) => {}) {
        super(scene);

        this.depth = 1;
        this.scenariosNames = CONFIG.scenes;
        this.currentScenarioIndex = 0;

        let pickingId = 501;

        // TextBoxes to player names
        this.player1Label = new MyLabel(this.scene, () => { return "PLAYER1" }, this.getShader(), this.TEXT_COLOR_RGBA);
        this.player1NameTextBox = new MyTextBox(scene, pickingId++, enableTextCallBack, this.getShader(), Player.PLAYER_1_DEFAULT_NAME, Player.PLAYER_LENGTH);
        this.player2Label = new MyLabel(this.scene, () => { return "PLAYER2" }, this.getShader(), this.TEXT_COLOR_RGBA);
        this.player2NameTextBox = new MyTextBox(scene, pickingId++, enableTextCallBack, this.getShader(), Player.PLAYER_2_DEFAULT_NAME, Player.PLAYER_LENGTH);

        // Buttons
        this.playButton  = new MyButton(scene, pickingId++, () => {
            const player1Name = this.player1NameTextBox.getContent();
            const player2Name = this.player2NameTextBox.getContent();

            let error1 = isOnlyWhiteSpaces(player1Name);
            let error2 = isOnlyWhiteSpaces(player2Name);

            if (player1Name == player2Name) {
                error1 = true;
                error2 = true;
            }

            if (error1 || error2) {
                this.player1NameTextBox.setError(error1);
                this.player2NameTextBox.setError(error2);
                return;
            }

            playCallBack(this.getCurrentScenarioFileName(), player1Name, player2Name);
        }, this.PLAY_TEXTURE_PATH, this.TEXT_COLOR_RGBA);
        this.scenarioRightButton = new MyButton(scene, pickingId++, () => { this.updateScenarioIndex(1) }, this.RIGHT_TEXTURE_PATH, this.TEXT_COLOR_RGBA);
        this.scenarioLeftButton = new MyButton(scene, pickingId++, () => { this.updateScenarioIndex(-1) }, this.LEFT_TEXTURE_PATH, this.TEXT_COLOR_RGBA);

        this.chooseScenarioLabelButton = new MyLabelButton(scene, this.getCurrentScenarioName.bind(this), this.scenarioRightButton, this.getShader(), this.TEXT_COLOR_RGBA, this.scenarioLeftButton);
        this.playLabelButton = new MyLabelButton(scene, () => { return "PLAY" }, this.playButton, this.getShader(), this.TEXT_COLOR_RGBA, this.playButton2);

        this.title = new MyLabel(this.scene, () => { return "CHECKERS" }, this.getShader(), this.TEXT_COLOR_RGBA, 1.5);
        this.scenarioLabel = new MyLabel(this.scene, () => { return "SCENARIO" }, this.getShader(), this.TEXT_COLOR_RGBA);
    }

    /**
     * Gets the dimensions of the menu.
     * @returns {Dimensions} - The dimensions of the menu
     */
    getDimensions() {
        return new Dimensions(15, 15, 1);
    }

    /**
     * Gets the title of the menu.
     * @returns {MyLabel} - The title of the menu
     */
    getTitle() {
        return this.title;
    }

    /**
     * Gets the labels of the menu.
     * @returns {MyLabel[]} - The labels of the menu
     */
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

    /**
     * Gets the currently selected scenario file name.
     * @returns {string} - The currently selected scenario file name
     * @returns {null} - If there are no scenarios
     */
    getCurrentScenarioFileName() {
        if (this.scenariosNames.length == 0) {
            return null;
        }

        return this.scenariosNames[this.currentScenarioIndex];
    }

    /**
     * Gets the currently selected scenario name with appropriate length.
     * @returns {string} - The currently selected scenario name with appropriate length
     */
    getCurrentScenarioName() {
        const fileName = this.getCurrentScenarioFileName();
        if (fileName == null) {
            return " ? ";
        }

        return textToLimitedCentered(removeFileExtension(fileName), 5);
    }

    /**
     * Updates the currently selected scenario index.
     * @param {number} delta - The delta to add to the current scenario index
     */
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
