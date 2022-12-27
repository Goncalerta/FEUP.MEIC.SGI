import { EventAnimation } from '../animations/EventAnimation.js';
import { CGFobject } from '../../lib/CGF.js';
import { MyBox } from '../MyBox.js';
import { quadMin } from '../animations/EasingFunctions.js';

export class MyButton extends CGFobject {
    MIN_RATIO_DEPTH = 0.5;

    constructor(scene, pickingId, commandCallBack=null, width=1, height=1, depth=1, icon_texture=null, icon_material=null) {
        super(scene);

        this.pickingId = pickingId;
        this.commandCallBack = commandCallBack;

        this.width = width;
        this.height = height;
        this.depth = depth;

        // TODO use these vv
        this.icon_texture = icon_texture;
        this.icon_material = icon_material;
        // ^^

        this.box = new MyBox(scene);
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
    }
}
