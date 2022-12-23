import { MyQuad } from "../MyQuad.js";
import { CGFobject, CGFtexture, CGFshader } from "../../lib/CGF.js";
import { getAppearance } from '../utils.js';


export class MyFont extends CGFobject {
    // TODO might need to use other font or adjust this (e.g. 'I' are weird since they are not centered)
    TEXTURE_PATH = "scenes/images/game/oolite-font.trans.png";
    MATERIAL = {
        shininess: 1,
        emission: [0, 0, 0, 1.0],
        ambient: [0, 0, 0, 1.0],
        diffuse: [0, 0, 0, 1.0],
        specular: [0, 0, 0, 1.0],
    };

    constructor(scene, width=1, height=1, elevated=0) {
        super(scene);
       
        this.quad = new MyQuad(scene);
        this.texture = new CGFtexture(scene, this.TEXTURE_PATH);
        this.appearance = getAppearance(scene, this.MATERIAL, this.texture);

        this.textShader = new CGFshader(scene.gl, "shaders/font.vert", "shaders/font.frag");
        this.textShader.setUniformsValues({'dims': [16, 16]});

        this.width = width;
        this.height = height;
        this.elevated = elevated;
    }

    // for efficiency reasons, this should be called only 'once'
    setShader() {
        this.scene.setActiveShaderSimple(this.textShader);
    }

    resetShader() {
        this.scene.setActiveShaderSimple(this.scene.defaultShader);
    }

    display(stringToDisplay) {
        this.appearance.apply();

        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.elevated);
        this.scene.scale(this.width, this.height, 1);

        let cumulativeTranslation = 0;
        for (let i = 0; i < stringToDisplay.length; i++) {
            if (stringToDisplay[i] === '\n') {
                this.scene.translate(-cumulativeTranslation, -1, 0);
                cumulativeTranslation = 0;
                continue;
            }

            const charCode = stringToDisplay.charCodeAt(i);
            const charX = charCode % 16;
            const charY = Math.floor(charCode / 16);

            // TODO: fix "WebGL: INVALID_OPERATION: uniformMatrix4fv: location is not from current program"
            this.textShader.setUniformsValues({'charCoords': [charX, charY]});
            this.quad.display();
            this.scene.translate(1, 0, 0);
            cumulativeTranslation += 1;
        }

        this.scene.popMatrix();
    }
}
