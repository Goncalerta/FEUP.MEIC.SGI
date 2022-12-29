import { MyRectangle } from "../MyRectangle.js";
import { CGFtexture, CGFshader } from "../../lib/CGF.js";
import { getAppearance } from '../utils.js';


export class MyFont {
    // TODO might need to use other font or adjust this (e.g. 'I' are weird since they are not centered)
    TEXTURE_PATH = "scenes/images/game/oolite-font.trans.png";
    MATERIAL = {
        shininess: 1,
        emission: [0, 0, 0, 1.0],
        ambient: [0, 0, 0, 1.0],
        diffuse: [0, 0, 0, 1.0],
        specular: [0, 0, 0, 1.0],
    };

    constructor(scene, fontSize=1, colorRGBa=[0,0,0,1], elevated=0.01) {
        this.scene = scene;
        
        this.fontSize = fontSize;

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

    writeChar(char) {
        const charCode = char.charCodeAt(0);
        const charX = charCode % 16;
        const charY = Math.floor(charCode / 16);
        this.textShader.setUniformsValues({'charCoords': [charX, charY]});

        this.scene.pushMatrix();
        this.scene.scale(this.fontSize, this.fontSize, 1);
        this.quad.display();
        this.scene.popMatrix();
    }

    writeCenteredEqualLines(stringToDisplay, writeRigid=true) {
        const lines = stringToDisplay.split('\n');
        const numLines = lines.length;

        this.scene.setActiveShaderSimple(this.textShader);
        this.appearance.apply();

        if (writeRigid) {
            this.scene.pushMatrix();
        }

        this.scene.translate(0.5 * this.fontSize, (numLines/2.0 - 0.5) * this.fontSize, this.elevated);

        for (let i = 0; i < numLines; i++) {
            const line = lines[i];
            const lineLength = line.length;
            const transCenter = lineLength/2.0 * this.fontSize;

            // center line
            this.scene.translate(-transCenter, 0, 0);

            for (let j = 0; j < lineLength; j++) {
                this.writeChar(line[j]);
                this.scene.translate(this.fontSize, 0, 0);
            }

            // center line
            this.scene.translate(-transCenter, -this.fontSize, 0);
        }

        if (writeRigid) {
            this.scene.popMatrix();
        }

        this.scene.setActiveShaderSimple(this.scene.defaultShader);
    }

    getTransAmountCenteredEqualLines(stringToDisplay) {
        return Math.max(0, ...stringToDisplay.split('\n').map(line => line.length/2.0 * this.fontSize));
    }
}
