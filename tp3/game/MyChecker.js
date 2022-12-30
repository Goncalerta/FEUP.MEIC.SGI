import { CGFobject } from '../../lib/CGF.js';
import { accelDecel, easeOutCubic, easeInCubic, identity, smoothPeak, quadPeak, gravityUp, gravityDown } from '../animations/EasingFunctions.js';
import { EventAnimation } from '../animations/EventAnimation.js';
import { EventAnimationChain } from '../animations/EventAnimationChain.js';
import { arraysEqual, getAppearance, interpolate } from '../utils.js';

/**
 * MyChecker class, representing a checker.
 */
export class MyChecker extends CGFobject {
    LEAP_HEIGHT = 0.8;
    DEFAULT_TOP_OFFSET = 0.01;
    MAX_MOVE_VELOCITY = 3;

    /**
     * @method constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {float} radius - Radius of the checker's base
     * @param {float} height - Height of the checker (along Z axis)
     * @param {integer} slices - Number of divisions around the Z axis (circumference)
     * @param {integer} stacks - Number of divisions along the Z axis
     */
    constructor(scene, geometries, materials, textures, model, pickingId, tileSize, radius, height, player, position = [0, 0], topOffset = 0.01) {
        super(scene);

        this.model = model;

        this.tileSize = tileSize;
        this.radius = radius;
        this.setPosition(position);
        this.geometries = geometries;
        this.selected = false;
        this.materials = materials;
        this.textures = textures;
        this.pickingId = pickingId;
        this.player = player;

        this.height = height;
        this.rotationRatio = 0;

        this.topOffset = topOffset;
    }

    calculatePosition(position) {
        return [(position[0] - 3.5) * this.tileSize, 0, -(position[1] - 3.5) * this.tileSize];
    }

    setPosition(position) {
        this.position = this.calculatePosition(position);
        this.boardPosition = position;
    }

    animateUnallowed() {
        const animation = new EventAnimation(this.scene, 0.4, identity);
        animation.onUpdate((t) => {
            this.animationColorWeight = t;
        });

        animation.onEnd(() => {
            this.animationColorWeight = null;
        });
        animation.start(this.scene.currentTime);
    }

    getPromotionAnimations() {
        const gravity = 9.8;
        const heightToReach = this.height * 30;
        const upDuration = Math.sqrt(2 * heightToReach / gravity);

        const upAnimation = new EventAnimation(this.scene, upDuration, gravityUp(gravity));
        upAnimation.onUpdate((t) => {
            this.position[1] = heightToReach * t;

            if (this.position[1] > this.radius) {
                this.rotationRatio = (1 - (this.position[1] - this.radius) / (heightToReach - this.radius)) * 3;
            }
        });
        upAnimation.onEnd(() => {
            this.position[1] = heightToReach;
        });

        const downAnimation = new EventAnimation(this.scene, upDuration, gravityDown(gravity));
        downAnimation.onUpdate((t) => {
            this.position[1] = heightToReach * (1 - t);
            this.topOffset = t;

            if (this.position[1] > this.radius) {
                this.rotationRatio = (1 - (this.position[1] - this.radius) / (heightToReach - this.radius)) * 3;
            } else {
                this.rotationRatio = 0.5;
            }
        });
        downAnimation.onEnd(() => {
            this.position[1] = 0;
            this.topOffset = 1;
        });

        return [upAnimation, downAnimation];
    }

    getMoveAnimations(endPosition, onTestCollision = null) {
        const animation = new EventAnimation(this.scene, 1);

        animation.onStart((params) => {
            params.startPosition = this.position;
            params.deltaPosition = [endPosition[0] - params.startPosition[0], endPosition[2] - params.startPosition[2]];
            
            const absDelta = Math.abs(params.deltaPosition[0])/this.tileSize;
            const accelerationTime = 0.5;
            const duration = 2 * accelerationTime + (absDelta - 1) / this.MAX_MOVE_VELOCITY;
            const xRatio = accelerationTime / duration;
            const yRatio = 0.5 / absDelta;
            animation.setDuration(duration);
            animation.easingFunction = accelDecel(easeInCubic, identity, easeOutCubic, xRatio, yRatio);
        });


        animation.onUpdate((t, params) => {
            this.position = [
                params.startPosition[0] + params.deltaPosition[0] * t,
                0,
                params.startPosition[2] + params.deltaPosition[1] * t,
            ];

            if (onTestCollision) {
                onTestCollision(animation);
            }
        });

        return [animation]; // TODO this will be 3 animations
    }

    getRecoilAnimations(capturedPiece, direction) {
        const recoilAnimation = new EventAnimation(this.scene, 0.5, easeOutCubic);

        recoilAnimation.onStart((params) => {
            const recoilDistance = this.tileSize;
            params.beginCaptured = [capturedPiece.position[0], capturedPiece.position[2]];
            const displacementFactor = 2 * this.radius * Math.sqrt(2);
            params.beginCapturer = [
                capturedPiece.position[0] - displacementFactor * direction[0], 
                capturedPiece.position[2] - displacementFactor * direction[1]
            ];
            params.deltaCaptured = [recoilDistance*direction[0], recoilDistance*direction[1]];
            params.deltaCapturer = [- recoilDistance*direction[0], - recoilDistance*direction[1]];
        });
        

        recoilAnimation.onUpdate((t, params) => {
            this.position = [
                params.beginCapturer[0] + params.deltaCapturer[0] * t,
                0,
                params.beginCapturer[1] + params.deltaCapturer[1] * t,
            ];

            capturedPiece.position = [
                params.beginCaptured[0] + params.deltaCaptured[0] * t,
                0,
                params.beginCaptured[1] + params.deltaCaptured[1] * t,
            ];
        });

        recoilAnimation.onEnd((params) => {
            this.position = [
                params.beginCapturer[0] + params.deltaCapturer[0],
                0,
                params.beginCapturer[1] + params.deltaCapturer[1],
            ];

            capturedPiece.position = [
                params.beginCaptured[0] + params.deltaCaptured[0],
                0,
                params.beginCaptured[1] + params.deltaCaptured[1],
            ];
            // this.player.changeScore(1); // TODO this should not be done inside MyChecker class
        });

        return [recoilAnimation];
    }

    getCaptureAnimations() {
        const captureAnimation = new EventAnimation(this.scene, 1, [identity, quadPeak]);
        
        captureAnimation.onStart((params) => {
            params.begin = [this.position[0], this.position[2]];
            params.end = this.scene.game.getDiscardBoard(this.player.getId()).fillSlot();
            params.delta = [params.end[0] - params.begin[0], params.end[2] - params.begin[1]];
            params.level = params.end[1] * (this.height + 0.001);
        });

        captureAnimation.onUpdate((t, params) => {
            this.position = [
                params.begin[0] + params.delta[0] * t[0],
                Math.max(this.LEAP_HEIGHT * t[1], params.level),
                params.begin[1] + params.delta[1] * t[0],
            ];
        });

        captureAnimation.onEnd((params) => {
            this.position = [params.end[0], Math.max(0, params.level), params.end[2]];
            this.boardPosition = null;
        });

        if (this.topOffset > this.DEFAULT_TOP_OFFSET) {
            const removeHeightAnimation = new EventAnimation(this.scene, 0.2, identity);

            removeHeightAnimation.onStart((params) => {
                params.begin = this.topOffset;
                params.delta = this.DEFAULT_TOP_OFFSET - params.begin;
            });

            removeHeightAnimation.onUpdate((t, params) => {
                this.topOffset = params.begin + params.delta * t;
            });

            removeHeightAnimation.onEnd(() => {
                this.topOffset = this.DEFAULT_TOP_OFFSET;
            });

            return [captureAnimation, removeHeightAnimation];
        }

        return [captureAnimation];
    }

    animateUndo(move, onEndCallback) {

    }

    animateMove(move, onEndCallback) {
        const endPosition = this.calculatePosition(move.to);
        
        let onTestCollision = null;
        if (move.captured) {
            const capturedPiece = this.scene.game.getChecker(move.captured[0], move.captured[1]);

            const deltaPosition = [endPosition[0] - this.position[0], endPosition[2] - this.position[2]];
            const absDelta = Math.abs(deltaPosition[0]) / this.tileSize;
            const direction = [deltaPosition[0] / absDelta, deltaPosition[1] / absDelta];
            
            onTestCollision = (animation) => {
                // TODO confirmar com a professora se é isto que querem como collision detection
                //      Para simplificar só usamos o xOz, ignorando o y.
                //      Para simplificar, apenas verificamos colisão entre a peça que mexe a peça potencialmente capturável
                //      Como nesta dimensão as peças são circulos com raios iguais, comparamos a distância em relação ao diametro
                
                const movingX = this.position[0];
                const movingZ = this.position[2];
                const capturedX = capturedPiece.position[0];
                const capturedZ = capturedPiece.position[2];
                const distance = Math.sqrt((movingX - capturedX) ** 2 + (movingZ - capturedZ) ** 2);
                const insideDistance = 2 * this.radius - distance;
                
                if (insideDistance >= 0) {
                    animation.interrupt();

                    const animations = new EventAnimationChain();
                    animations.push(...this.getRecoilAnimations(capturedPiece, direction));
                    animations.push(...capturedPiece.getCaptureAnimations());
                    animations.push(...this.getMoveAnimations(endPosition));
                    
                    if (move.promoted) {
                        animations.push(...this.getPromotionAnimations());
                    }
                    animations.onEnd(() => {
                        this.setPosition(move.to);
                        onEndCallback();
                    });
                    
                    const insideTime = insideDistance / this.MAX_MOVE_VELOCITY;
                    animations.start(this.scene.currentTime - insideTime);
                }
            }
        }

        const animations = new EventAnimationChain();
        animations.push(...this.getMoveAnimations(endPosition, onTestCollision));
        if (move.promoted) {
            animations.push(...this.getPromotionAnimations());
        }
        animations.onEnd(() => {
            this.setPosition(move.to);
            onEndCallback();
        });
        animations.start(this.scene.currentTime);
    }

    // TODO obsolete
    oldAnimateMove(move, onEndCallback) {
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

            if (move.promoted) {
                this.animatePromote(onEndCallback);
            } else {
                onEndCallback();
            }
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
                        const end = this.scene.game.getDiscardBoard(this.model.getOpponentId(this.player.getId())).fillSlot();
                        const delta = [end[0] - begin[0], end[2] - begin[1]];
                        const level = end[1] * (this.height + 0.001);

                        captureAnimation.onUpdate((t) => {
                            capturedPiece.position = [
                                begin[0] + delta[0] * t[0],
                                Math.max(this.LEAP_HEIGHT * t[1], level),
                                begin[1] + delta[1] * t[0],
                            ];
                        });

                        captureAnimation.onEnd(() => {
                            capturedPiece.position = [end[0], Math.max(0, level), end[2]];
                            capturedPiece.boardPosition = null;

                            if (capturedPiece.topOffset > this.DEFAULT_TOP_OFFSET) {
                                const removeHeightAnimation = new EventAnimation(this.scene, 0.2, identity);
                                const begin = capturedPiece.topOffset;
                                const delta = this.DEFAULT_TOP_OFFSET - begin;

                                removeHeightAnimation.onUpdate((t) => {
                                    capturedPiece.topOffset = begin + delta * t;
                                });

                                removeHeightAnimation.onEnd(() => {
                                    capturedPiece.topOffset = this.DEFAULT_TOP_OFFSET;
                                });

                                removeHeightAnimation.start(this.scene.currentTime);
                            }
                            
                            const startPosition = this.position;
                            const endPosition = this.calculatePosition(move.to);
                            const deltaPosition = [endPosition[0] - startPosition[0], endPosition[2] - startPosition[2]];
                            const absDelta = Math.abs(deltaPosition[0]);

                            const accelerationTime = 0.5;
                            const velocity = 3;
                            const duration = 2 * accelerationTime + (absDelta/this.tileSize - 1)/velocity;
                            const xRatio = accelerationTime / duration;
                            const yRatio = 0.5 * this.tileSize / absDelta;

                            const animation = new EventAnimation(this.scene, duration, accelDecel(easeInCubic, identity, easeOutCubic, xRatio, yRatio));

                            animation.onEnd(() => {
                                this.setPosition(move.to);

                                if (move.promoted) {
                                    this.animatePromote(onEndCallback);
                                } else {
                                    onEndCallback();
                                }
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
                        this.player.changeScore(1); // TODO this should not be done inside MyChecker class
                    });

                    recoilAnimation.start(this.scene.currentTime - insideTime);
                }
            }
        });

        animation.start(this.scene.currentTime);
    }

    // TODO obsolete
    animatePromote(onEndCallback) {
        const gravity = 9.8;
        const heightToReach = this.height * 30;
        const upDuration = Math.sqrt(2 * heightToReach / gravity);
        const upAnimation = new EventAnimation(this.scene, upDuration, gravityUp(gravity));

        upAnimation.onUpdate((t) => {
            this.position[1] = heightToReach * t;

            if (this.position[1] > this.radius) {
                this.rotationRatio = (1 - (this.position[1] - this.radius) / (heightToReach - this.radius)) * 3;
            }
        });

        upAnimation.onEnd(() => {
            this.position[1] = heightToReach;

            const downAnimation = new EventAnimation(this.scene, upDuration, gravityDown(gravity));

            downAnimation.onUpdate((t) => {
                this.position[1] = heightToReach * (1 - t);
                this.topOffset = t;

                if (this.position[1] > this.radius) {
                    this.rotationRatio = (1 - (this.position[1] - this.radius) / (heightToReach - this.radius)) * 3;
                } else {
                    this.rotationRatio = 0.5;
                }
            });

            downAnimation.onEnd(() => {
                this.position[1] = 0;
                this.topOffset = 1;
                onEndCallback();
            });

            downAnimation.start(this.scene.currentTime);
        });

        upAnimation.start(this.scene.currentTime);
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
        let material;
        if (selected) {
            material = this.materials["selected"];
        } else {
            const highlighted = this.model.state.getHighlightedPieces().some((position) => arraysEqual(position, this.boardPosition));
            if (highlighted) {
                material = this.materials["highlighted"];
            } else {
                material = this.materials["normal"];
            }
        }

        if (this.animationColorWeight) {
            material = interpolate(this.materials["unallowed"], material, this.animationColorWeight);
        }

        const appearance = getAppearance(this.scene, material);

        this.scene.registerForPick(this.pickingId, this);
        this.scene.pushMatrix();
        
        this.scene.translate(this.position[0], this.position[1] + (this.rotationRatio == 0 ? this.height : 0), this.position[2]);
        this.scene.rotate(this.rotationRatio * Math.PI * 2, 0, 0, 1);
        this.scene.rotate(this.rotationRatio * Math.PI * 2, 0, 1, 0);

        if (this.player.getId() === 1) {
            this.scene.rotate(Math.PI, 0, 1, 0);
        }
        this.scene.rotate(Math.PI / 2, 1, 0, 0);

        appearance.setTexture(this.textures["side"]);
        appearance.apply();
        this.geometries["major_cylinder"].display();

        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.topOffset*this.height);
        this.geometries["minor_cylinder"].display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.height);
        appearance.setTexture(this.textures["unpromoted_base"]);
        appearance.apply();
        this.geometries["major_circle"].display();

        this.scene.translate(0, 0, this.topOffset*this.height);
        appearance.setTexture(this.textures["promoted_base"]);
        appearance.apply();
        this.geometries["minor_circle"].display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 1, 0, 0);
        appearance.setTexture(this.textures["unpromoted_base"]);
        appearance.apply();
        this.geometries["major_circle"].display();
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
}
