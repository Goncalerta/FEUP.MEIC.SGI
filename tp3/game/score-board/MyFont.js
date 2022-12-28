import { MyRectangle } from "../../MyRectangle.js";
import { CGFobject, CGFtexture, CGFshader } from "../../../lib/CGF.js";
import { getAppearance } from '../../utils.js';


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

    constructor(scene, elevated=0, colorRGBa=[0.0,0.0,0.0,1.0]) {
        super(scene);
       
        this.quad = new MyRectangle(scene, -0.5, 0.5, -0.5, 0.5);
        this.texture = new CGFtexture(scene, this.TEXTURE_PATH);
        this.appearance = getAppearance(scene, this.MATERIAL, this.texture);

        this.textShader = new CGFshader(scene.gl, "shaders/font.vert", "shaders/font.frag");
        this.textShader.setUniformsValues({
            'dims': [16, 16],
            'colorRGBa': colorRGBa
        });

        this.elevated = elevated;
    }

    // for efficiency reasons, this should be called only 'once'
    setShader() {
        this.scene.setActiveShaderSimple(this.textShader);
    }

    resetShader() {
        this.scene.setActiveShaderSimple(this.scene.defaultShader);
    }

    displayChar(char) {
        const charCode = char.charCodeAt(0);
        const charX = charCode % 16;
        const charY = Math.floor(charCode / 16);
        this.textShader.setUniformsValues({'charCoords': [charX, charY]});
        this.quad.display();
    }

    displayCenteredEqualLines(stringToDisplay) {
        let transAmount = [0, 0];

        const lines = stringToDisplay.split('\n');
        const numLines = lines.length;
        transAmount[1] = numLines/2.0 - 0.5;

        this.appearance.apply();

        this.scene.pushMatrix();
        this.scene.translate(0.5, transAmount[1], this.elevated);

        for (let i = 0; i < numLines; i++) {
            const line = lines[i];
            const lineLength = line.length;
            transAmount[0] = Math.max(transAmount[0], lineLength/2.0);

            // center line
            this.scene.translate(-lineLength/2, 0, 0);

            for (let j = 0; j < lineLength; j++) {
                this.displayChar(line[j]);
                this.scene.translate(1, 0, 0);
            }

            // center line
            this.scene.translate(-lineLength/2, -1, 0);
        }

        this.scene.popMatrix();

        return transAmount;
    }
}
