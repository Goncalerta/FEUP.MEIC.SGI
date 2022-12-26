import { CGFobject } from '../../lib/CGF.js';
import { accelDecel, easeOutCubic, easeInCubic, identity, smoothPeak, quadPeak } from '../animations/EasingFunctions.js';
import { EventAnimation } from '../animations/EventAnimation.js';

/**
 * MyChecker class, representing a checker.
 */
export class MyChecker extends CGFobject {
    LEAP_HEIGHT = 0.8;

    /**
     * @method constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {float} radius - Radius of the checker's base
     * @param {float} height - Height of the checker (along Z axis)
     * @param {integer} slices - Number of divisions around the Z axis (circumference)
     * @param {integer} stacks - Number of divisions along the Z axis
     */
    constructor(scene, geometries, textures, texturesSelected, model, pickingId, tileSize, radius, height, playerId = 1, position = [0, 0], topOffset = 0.01) {
        super(scene);

        this.model = model;

        this.tileSize = tileSize;
        this.radius = radius;
        this.setPosition(position);
        this.geometries = geometries;
        this.selected = false;
        this.texture = textures;
        this.texturesSelected = texturesSelected;
        this.pickingId = pickingId;
        this.playerId = playerId;

        this.height = height;

        // TODO basically promotion will be animated by rotating the checker and then the offset will pop from 0.01 to 1.0
        this.topOffset = topOffset;
    }

    calculatePosition(position) {
        return [(position[0] - 3.5) * this.tileSize, 0, -(position[1] - 3.5) * this.tileSize];
    }

    setPosition(position) {
        this.position = this.calculatePosition(position);
        this.boardPosition = position;
    }

    animateMove(move, onEndCallback) {
        const startPosition = this.calculatePosition(move.from);
        const endPosition = this.calculatePosition(move.to);
        const deltaPosition = [endPosition[0] - startPosition[0], endPosition[2] - startPosition[2]];
        const absDelta = Math.abs(move.to[0] - move.from[0]);
        const direction = [deltaPosition[0] / absDelta, deltaPosition[1] / absDelta];

        const accelerationTime = 0.5;
        const velocity = 3;
        const duration = 2 * accelerationTime + (absDelta - 1)/velocity;
        const xRatio = accelerationTime / duration;
        const yRatio = 0.5 / absDelta;

        const capturedPiece = move.captured? this.scene.game.getChecker(move.captured[0], move.captured[1]) : null;

        const animation = new EventAnimation(this.scene, duration, accelDecel(easeInCubic, identity, easeOutCubic, xRatio, yRatio));

        animation.onEnd(() => {
            this.setPosition(move.to);
            onEndCallback();
        });

        animation.onUpdate((t) => {
            this.position = [
                startPosition[0] + deltaPosition[0] * t,
                0,
                startPosition[2] + deltaPosition[1] * t,
            ];

            // TODO confirmar com a professora se é isto que querem como collision detection
            //      Para simplificar só usamos o xOz, ignorando o y.
            //      Para simplificar, apenas verificamos colisão entre a peça que mexe a peça potencialmente capturável
            //      Como nesta dimensão as peças são circulos com raios iguais, comparamos a distância em relação ao diametro
            if (capturedPiece) {
                const movingX = this.position[0];
                const movingZ = this.position[2];
                const capturedX = capturedPiece.position[0];
                const capturedZ = capturedPiece.position[2];
                const distance = Math.sqrt((movingX - capturedX) ** 2 + (movingZ - capturedZ) ** 2);
                const insideDistance = 2 * this.radius - distance;
                
                if (insideDistance >= 0) {
                    animation.interrupt();
                    const insideTime = insideDistance / velocity;
                    const recoilDistance = this.tileSize;

                    const recoilAnimation = new EventAnimation(this.scene, 0.5, easeOutCubic);
                    const beginCaptured = [capturedPiece.position[0], capturedPiece.position[2]];
                    const beginCapturer = [capturedPiece.position[0] - 2 * this.radius * Math.sqrt(2) * direction[0], capturedPiece.position[2] - 2 * this.radius * Math.sqrt(2) * direction[1]];
                    const deltaCaptured = [recoilDistance*direction[0], recoilDistance*direction[1]];
                    const deltaCapturer = [- recoilDistance*direction[0], - recoilDistance*direction[1]];

                    recoilAnimation.onUpdate((t) => {
                        this.position = [
                            beginCapturer[0] + deltaCapturer[0] * t,
                            0,
                            beginCapturer[1] + deltaCapturer[1] * t,
                        ];

                        capturedPiece.position = [
                            beginCaptured[0] + deltaCaptured[0] * t,
                            0,
                            beginCaptured[1] + deltaCaptured[1] * t,
                        ];
                    });

                    recoilAnimation.onEnd(() => {
                        const captureAnimation = new EventAnimation(this.scene, 1, [identity, quadPeak]);
                        const begin = [capturedPiece.position[0], capturedPiece.position[2]];
                        const end = this.scene.game.getDiscardBoard(this.model.getOpponentId(this.playerId)).fillSlot();
                        const delta = [end[0] - begin[0], end[2] - begin[1]];
                        // TODO take into account level, aka end[1]
                        
                        captureAnimation.onUpdate((t) => {
                            capturedPiece.position = [
                                begin[0] + delta[0] * t[0],
                                this.LEAP_HEIGHT * t[1],
                                begin[1] + delta[1] * t[0],
                            ];
                        });

                        captureAnimation.onEnd(() => {
                            capturedPiece.position = [end[0], 0, end[2]];
                            capturedPiece.boardPosition = null;
                            
                            const startPosition = this.position;
                            const endPosition = this.calculatePosition(move.to);
                            const deltaPosition = [endPosition[0] - startPosition[0], endPosition[2] - startPosition[2]];
                            const absDelta = Math.abs(move.to[0] - move.from[0]);

                            const accelerationTime = 0.5;
                            const velocity = 3;
                            const duration = 2 * accelerationTime + (absDelta - 1)/velocity;
                            const xRatio = accelerationTime / duration;
                            const yRatio = 0.5 / absDelta;

                            const animation = new EventAnimation(this.scene, duration, accelDecel(easeInCubic, identity, easeOutCubic, xRatio, yRatio));

                            animation.onEnd(() => {
                                this.setPosition(move.to);
                                onEndCallback();
                            });

                            animation.onUpdate((t) => {
                                this.position = [
                                    startPosition[0] + deltaPosition[0] * t,
                                    0,
                                    startPosition[2] + deltaPosition[1] * t,
                                ];
                            });

                            animation.start(this.scene.currentTime);
                        });

                        captureAnimation.start(this.scene.currentTime - insideTime);
                    });

                    recoilAnimation.start(this.scene.currentTime - insideTime);
                }
            }
        });

        animation.start(this.scene.currentTime);
    }

    onClick(id) {
        if (!this.boardPosition) {
            return;
        }

        this.model.state.selectPiece(this, ...this.boardPosition);
    }

    /**
     * Displays the checker
     */
    display() {
        const selected = this.model.state.getSelectedPiece() === this;
        const texture = selected? this.texturesSelected : this.texture;

        this.scene.registerForPick(this.pickingId, this);
        this.scene.pushMatrix();
        
        this.scene.translate(this.position[0], this.position[1] + this.height, this.position[2]);
        if (this.playerId === 1) {
            this.scene.rotate(Math.PI, 0, 1, 0);
        }
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        

        texture["side"].apply();
        this.geometries["major_cylinder"].display();

        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.topOffset*this.height);
        this.geometries["minor_cylinder"].display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.height);
        texture["unpromoted_base"].apply();
        this.geometries["major_circle"].display();

        this.scene.translate(0, 0, this.topOffset*this.height);
        texture["promoted_base"].apply();
        this.geometries["minor_circle"].display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 1, 0, 0);
        texture["unpromoted_base"].apply();
        this.geometries["major_circle"].display();
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
}
