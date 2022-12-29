import { CGFtexture } from "../../../../lib/CGF.js";
import { getAppearance } from '../../../utils.js';
import { MyBox } from "../../../MyBox.js";

export class MyMainMenuBox extends MyBox {
    // TODO adjust material and texture (?)
    static TEXTURE_PATH = "scenes/images/game/wood.jpg";
    static MATERIAL = {
        shininess: 10,
        emission: [0.3, 0.24, 0.24, 1.0],
        ambient: [0.7, 0.6, 0.6, 1.0],
        diffuse: [0.9, 0.7, 0.7, 1.0],
        specular: [0.8, 0.6, 0.6, 1.0],
    };

    constructor(scene) {
        const texture = new CGFtexture(scene, MyMainMenuBox.TEXTURE_PATH);
        const appearance = getAppearance(scene, MyMainMenuBox.MATERIAL, texture);

        super(scene, appearance);
    }
}
