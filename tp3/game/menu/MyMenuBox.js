import { CGFtexture } from "../../../lib/CGF.js";
import { getAppearance } from '../../utils.js';
import { MyBox } from "../../MyBox.js";

/**
 * MyMenuBox class, representing a menu box.
 */
export class MyMenuBox extends MyBox {
    static TEXTURE_PATH = "scenes/images/game/wood.jpg";
    static MATERIAL = {
        shininess: 10,
        emission: [0.25, 0.22, 0.22, 1.0],
        ambient: [0.7, 0.6, 0.6, 1.0],
        diffuse: [0.45, 0.35, 0.35, 1.0],
        specular: [0.08, 0.06, 0.06, 1.0]
    };

    /**
     * @constructor
     * @param {CGFscene} scene - MyScene object
     */
    constructor(scene) {
        const texture = new CGFtexture(scene, MyMenuBox.TEXTURE_PATH);
        const appearance = getAppearance(scene, MyMenuBox.MATERIAL, texture);

        super(scene, appearance);
    }
}
