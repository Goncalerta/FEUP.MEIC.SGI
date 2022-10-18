import { CGFinterface, CGFapplication, dat } from '../lib/CGF.js';

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

        // add a group of controls (and open/expand by defult)

        this.clickCallbacks = {};

        return true;
    }

    onClick(keyCode, callback) {
        if (this.clickCallbacks[keyCode] == null) {
            this.clickCallbacks[keyCode] = [];
        }

        this.clickCallbacks[keyCode].push(callback);
    }

    processKeyUp(event) {
        if (this.clickCallbacks[event.code] === null) {
            return;
        }

        for (let callback of this.clickCallbacks[event.code]) {
            callback();
        }
    };

    processKeyDown(event) {
        // Not needed
    };

    processKeyboard(event) {
        // Not needed
    };
}
