import { CGFinterface, CGFapplication, dat } from "../lib/CGF.js";

/**
 * MyInterface class, creating a GUI interface.
 */
export class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
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
     * Processes the event of a key being up.
     * @param event
     */
    processKeyUp(event) {
        if (!(event.code in this.clickCallbacks)) {
            // No callbacks for this key code.
            return;
        }

        // Call all callbacks.
        for (let callback of this.clickCallbacks[event.code]) {
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
