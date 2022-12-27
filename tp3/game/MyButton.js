import { EventAnimation } from '../animations/EventAnimation.js';
import { CGFobject, CGFtexture, CGFshader } from '../../lib/CGF.js';
import { MyBox } from '../MyBox.js';
import { MyRectangle } from '../MyRectangle.js';
import { quadMin } from '../animations/EasingFunctions.js';
import { getAppearance } from '../utils.js';

export class MyButton extends CGFobject {
    MIN_RATIO_DEPTH = 0.5;
    TEXTURE_PATH = "scenes/images/game/wood.jpg";
    MATERIAL = {
        shininess: 0,
        emission: [0.3, 0.24, 0.24, 1.0],
        ambient: [0.7, 0.6, 0.6, 1.0],
        diffuse: [0.9, 0.7, 0.7, 1.0],
        specular: [0.8, 0.6, 0.6, 1.0],
    };

    constructor(scene, pickingId, commandCallBack=null, width=1, height=1, depth=1, iconPath=null, iconColor=[1,1,1,1]) {
        super(scene);

        this.pickingId = pickingId;
        this.commandCallBack = commandCallBack;

        this.width = width;
        this.height = height;
        this.depth = depth;

        const iconTexture = iconPath ? new CGFtexture(scene, iconPath) : null;
        this.iconAppearance = iconTexture ? getAppearance(scene, this.MATERIAL, iconTexture) : null;
        this.iconShader = new CGFshader(scene.gl, "shaders/transparent.vert", "shaders/transparent.frag");
        this.iconShader.setUniformsValues({ colorRGBa: iconColor });

        const texture = new CGFtexture(scene, this.TEXTURE_PATH);
        const appearance = getAppearance(scene, this.MATERIAL, texture);

        this.box = new MyBox(scene, appearance);
        this.quad = new MyRectangle(scene, -0.5, 0.5, -0.5, 0.5);
        this.currentDepth = depth;
    }

    onClick() {
        const pressAnimation = new EventAnimation(this.scene, 1, quadMin(this.MIN_RATIO_DEPTH));
        let callBackCalled = false;

        pressAnimation.onUpdate((t) => {
            this.currentDepth = this.depth * t;

            if (!callBackCalled && this.commandCallBack && t >= 0.5) {
                callBackCalled = true;
                this.commandCallBack();
            }
        });

        pressAnimation.start(this.scene.currentTime);
    }

    display() {
        this.scene.registerForPick(this.pickingId, this);

        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.currentDepth / 2);
        this.scene.scale(this.width, this.height, this.currentDepth);
        this.box.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.currentDepth + 0.001);
        this.scene.scale(this.width, this.height, 1);

        if (this.iconAppearance) {
            this.scene.setActiveShaderSimple(this.iconShader);
            this.iconAppearance.apply();
            this.quad.display();
            this.scene.setActiveShaderSimple(this.scene.defaultShader);
        }

        this.scene.popMatrix();
    }
}
