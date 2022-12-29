import { degreeToRad } from "../utils.js";
import { CGFcamera } from "../../lib/CGF.js";

export class MyGameCameras {
    CAMERA_ANGLE = degreeToRad(23);
    CAMERA_NEAR = 0.1;
    CAMERA_FAR = 5000;
    CAMERA_TO_POSITION = [0, 0, 0];

    constructor(scene) {
        this.scene = scene;

        this.cameraP1    = new CGFcamera(this.CAMERA_ANGLE, this.CAMERA_NEAR, this.CAMERA_FAR, [ 2, 8, 10], this.CAMERA_TO_POSITION);
        this.cameraP2    = new CGFcamera(this.CAMERA_ANGLE, this.CAMERA_NEAR, this.CAMERA_FAR, [ 2, 8,-10], this.CAMERA_TO_POSITION);
        this.cameraFront = new CGFcamera(this.CAMERA_ANGLE, this.CAMERA_NEAR, this.CAMERA_FAR, [12,  4,  0], this.CAMERA_TO_POSITION);

        this.currentCamera = null;
    }

    setPlayerCamera(playerId) {
        if (playerId != 1 && playerId != 2) {
            return;
        }

        const camera = this[`cameraP${playerId}`];

        if (this.currentCamera === camera) {
            return;
        }

        if (playerId === 1 && this.currentCamera === this.cameraP2
            || playerId === 2 && this.currentCamera === this.cameraP1) {
            this.scene.setCamera([this.cameraFront, camera]);
        } else {
            this.scene.setCamera([camera]);
        }

        this.currentCamera = camera;
    }

    setFrontCamera() {
        if (this.currentCamera === this.cameraFront) {
            return;
        }

        this.scene.setCamera([this.cameraFront]);
        this.currentCamera = this.cameraFront;
    }
}
