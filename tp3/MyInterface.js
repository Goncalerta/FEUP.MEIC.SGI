import {CGFinterface, CGFapplication, dat} from '../lib/CGF.js';

/**
 * MyInterface class, creating a GUI interface.
 */
export class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
        this.onClickTextActivated = false
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // Callbacks for when a key is clicked.
        this.clickCallbacks = {};

        return true;
    }

    /**
     * Adds callback for when a key is clicked.
     * @param {string} keyCode the key that triggers the callback.
     * @param {Function} callback the callback triggered.
     */
    onClick(keyCode, callback) {
        if (this.clickCallbacks[keyCode] == null) {
            // Initialize array
            this.clickCallbacks[keyCode] = [];
        }

        this.clickCallbacks[keyCode].push(callback);
    }

    /**
     * Adds a callback for all text keys.
     * @param {Function} callback which takes a key.
     */
    onClickText(callback) {
        if (this.onClickTextActivated) {
            this.removeOnClickTextIfAny();
        }

        for (let i = 65; i <= 90; i++) {
            let char = String.fromCharCode(i);
            // Add callback for all letters.
            this.onClick("Key" + char, () => { callback(char) });
        }

        // Add callback for space.
        this.onClick("Space", () => { callback(" ") });

        // Add callback for backspace.
        this.onClick("Backspace", () => { callback("Backspace") });

        this.onClickTextActivated = true;
    }

    /**
     * Removes last callbacks added for text keys.
     */
    removeOnClickTextIfAny() {
        if (!this.onClickTextActivated) {
            return;
        }

        for (let i = 65; i <= 90; i++) {
            let  char = String.fromCharCode(i);
            // Add callback for all letters.
            this.clickCallbacks["Key" + char].pop();
        }

        // Add callback for space.
        this.clickCallbacks["Space"].pop();

        // Add callback for backspace.
        this.clickCallbacks["Backspace"].pop();

        this.onClickTextActivated = false;
    }

    /**
     * Processes the event of a key being up.
     * @param event
     */
    processKeyUp(event) {
        if (!(event.code in this.clickCallbacks)) {
            // No callbacks for this key code.
            return;
        }

        // Call all callbacks.
        for (const callback of this.clickCallbacks[event.code]) {
            callback();
        }
    }

    /**
     * Processes the event of a key being down.
     * @param event
     */
    processKeyDown(event) {
        // Not needed
    }

    /**
     * Processes keyboard events.
     * @param event
     */
    processKeyboard(event) {
        // Not needed
    }
}
