import { degreeToRad } from "../utils.js";
import { CGFcamera } from "../../lib/CGF.js";

export class MyGameCameras {
    CAMERA_ANGLE = degreeToRad(23);
    CAMERA_NEAR = 0.1;
    CAMERA_FAR = 5000;
    CAMERA_TO_POSITION = [0, 0, 0];

    constructor(scene) {
        this.scene = scene;

        this.cameraP1    = new CGFcamera(this.CAMERA_ANGLE, this.CAMERA_NEAR, this.CAMERA_FAR, [ 3, 8, 10], this.CAMERA_TO_POSITION);
        this.cameraP2    = new CGFcamera(this.CAMERA_ANGLE, this.CAMERA_NEAR, this.CAMERA_FAR, [ 3, 8,-10], this.CAMERA_TO_POSITION);
        this.cameraFront = new CGFcamera(this.CAMERA_ANGLE, this.CAMERA_NEAR, this.CAMERA_FAR, [12,  4,  0], this.CAMERA_TO_POSITION);
    }

    setPlayerCamera(playerId) {
        if (playerId != 1 && playerId != 2) {
            return;
        }

        this.scene.setCamera([this[`cameraP${playerId}`]]);
    }

    setFrontCamera() {
        this.scene.setCamera([this.cameraFront]);
    }
}
