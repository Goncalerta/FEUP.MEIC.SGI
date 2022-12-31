import { CGFobject } from '../../lib/CGF.js';
import { easeOutCubic, easeInCubic, identity, gravityUp, gravityDown, easeInQuad, easeOutQuad } from '../animations/EasingFunctions.js';
import { EventAnimation } from '../animations/EventAnimation.js';
import { EventAnimationChain } from '../animations/EventAnimationChain.js';
import { arraysEqual, getAppearance, interpolate } from '../utils.js';

/**
 * MyChecker class, representing a checker.
 */
export class MyChecker extends CGFobject {
    JUMP_HEIGHT = 0.8;
    DEFAULT_TOP_OFFSET = 0.01;
    MAX_MOVE_1D_VELOCITY = 2.9;
    PROMOTION_HEIGHT = 3;
    GRAVITY = 9.8;
    PROMOTION_FULL_TURNS = 5;

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
        this.rotation = 0;

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

    getPromotionAnimations(reversed = false) {
        // TODO gravity or easeOutQuad - easeInQuad pair (1 second each)?
        const halfDuration = Math.sqrt(2 * this.PROMOTION_HEIGHT / this.GRAVITY);

        const upAnimation = new EventAnimation(this.scene, halfDuration, gravityUp(this.GRAVITY));
        upAnimation.onUpdate((t) => {
            this.position[1] = this.PROMOTION_HEIGHT * t;
            if (reversed) {
                this.topOffset = Math.max(1 - t, this.DEFAULT_TOP_OFFSET);
            }

            if (this.position[1] > this.radius) {
                this.rotation = (1 - (this.position[1] - this.radius) / (this.PROMOTION_HEIGHT - this.radius)) * 3;
                // if (reversed) {
                //     this.rotation += 0.5;
                // }
            }
        });
        upAnimation.onEnd(() => {
            this.position[1] = this.PROMOTION_HEIGHT;
        });

        const downAnimation = new EventAnimation(this.scene, halfDuration, gravityDown(this.GRAVITY));
        downAnimation.onUpdate((t) => {
            this.position[1] = this.PROMOTION_HEIGHT * (1 - t);
            if (!reversed) {
                this.topOffset = Math.max(t, this.DEFAULT_TOP_OFFSET);
            }

            if (this.position[1] > this.radius) {
                this.rotation = (1 - (this.position[1] - this.radius) / (this.PROMOTION_HEIGHT - this.radius)) * 3;
                // if (reversed) {
                //     this.rotation += 0.5;
                // }
            } else {
                // TODO a animação é gira, mas se pusermos em camara lenta ve-se que ha um corte em que ela roda 180º instantaneamente
                this.rotation = reversed? 0 : 0.5;
            }
        });
        downAnimation.onEnd(() => {
            this.position[1] = 0;
            this.topOffset = reversed? this.DEFAULT_TOP_OFFSET : 1;
        });

        return [upAnimation, downAnimation];
    }

    getMoveAnimations(direction, endPosition, onTestCollision = null) {
        // The direction is only used to walk half a tile
        const scaledDirection = [direction[0] / 2, direction[1] / 2];

        const accelAnimation = new EventAnimation(this.scene, 0.5, easeInCubic);
        const uniformAnimation = new EventAnimation(this.scene, 0, identity);
        const decelAnimation = new EventAnimation(this.scene, 0.5, easeOutCubic);

        const onUpdate = (animation) => (t, params) => {
            this.position = [
                params.startPosition[0] + params.deltaPosition[0] * t,
                0,
                params.startPosition[2] + params.deltaPosition[1] * t,
            ];

            if (onTestCollision) {
                onTestCollision(animation);
            }
        };

        accelAnimation.onUpdate(onUpdate(accelAnimation));
        uniformAnimation.onUpdate(onUpdate(uniformAnimation));
        decelAnimation.onUpdate(onUpdate(decelAnimation));

        accelAnimation.onStart((params) => {
            params.startPosition = this.position;
            params.deltaPosition = scaledDirection;
            params.endPosition = [
                params.startPosition[0] + params.deltaPosition[0], 
                params.startPosition[1], 
                params.startPosition[2] + params.deltaPosition[1]
            ];
        });

        uniformAnimation.onStart((params) => {
            params.startPosition = this.position;
            params.endPosition = [endPosition[0] - scaledDirection[0], endPosition[1], endPosition[2] - scaledDirection[1]];

            params.deltaPosition = [params.endPosition[0] - params.startPosition[0], params.endPosition[2] - params.startPosition[2]];
            uniformAnimation.setDuration(Math.abs(params.deltaPosition[0]) / this.tileSize / this.MAX_MOVE_1D_VELOCITY);
        });

        decelAnimation.onStart((params) => {
            params.startPosition = this.position;
            params.endPosition = endPosition;
            params.deltaPosition = [params.endPosition[0] - params.startPosition[0], params.endPosition[2] - params.startPosition[2]];
        });

        const onEnd = (params) => {
            this.position = params.endPosition;
        };

        accelAnimation.onEnd(onEnd);
        uniformAnimation.onEnd(onEnd);
        decelAnimation.onEnd(onEnd);

        return [accelAnimation, uniformAnimation, decelAnimation];
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

    getChangeHeightAnimation(finalHeight) {
        const changeHeightAnimation = new EventAnimation(this.scene, 0.25, identity);

        changeHeightAnimation.onStart((params) => {
            params.begin = this.topOffset;
            params.delta = finalHeight - params.begin;
        });

        changeHeightAnimation.onUpdate((t, params) => {
            this.topOffset = params.begin + params.delta * t;
        });

        changeHeightAnimation.onEnd(() => {
            this.topOffset = finalHeight;
        });

        return changeHeightAnimation;
    }

    getJumpAnimations(endPosition, endBoardPosition, onStart = null, keepOrientation = true) {
        const onUpdate = (t, params) => {
            this.position = [
                params.begin[0] + params.delta[0] * t[0],
                params.begin[1] + params.delta[1] * t[1],
                params.begin[2] + params.delta[2] * t[0],
            ];
            this.rotation = params.rotationBegin + params.rotationDelta * t[0];
        };

        const upAnimation = new EventAnimation(this.scene, 0.5, [identity, easeOutQuad]);
        upAnimation.onStart((params) => {
            if (onStart) {
                onStart();
            }
            params.begin = [this.position[0], this.position[1], this.position[2]];
            params.delta = [(endPosition[0] - this.position[0]) / 2, this.JUMP_HEIGHT - this.position[1], (endPosition[2] - this.position[2]) / 2];
            params.end = [params.begin[0] + params.delta[0], params.begin[1] + params.delta[1], params.begin[2] + params.delta[2]];
            params.rotationBegin = this.rotation;
            params.rotationDelta = keepOrientation ? 0 : -this.rotation / 2;
        });
        upAnimation.onUpdate(onUpdate);
        upAnimation.onEnd((params) => {
            this.position = [params.end[0], params.end[1], params.end[2]];
            this.rotation = keepOrientation ? this.rotation : this.rotation / 2;
        });

        const downAnimation = new EventAnimation(this.scene, 0.5, [identity, easeInQuad]);
        downAnimation.onStart((params) => {
            params.begin = [this.position[0], this.position[1], this.position[2]];
            params.end = [endPosition[0], endPosition[1] * (this.height + 0.001), endPosition[2]];
            params.delta = [params.end[0] - params.begin[0], params.end[1] - params.begin[1], params.end[2] - params.begin[2]];
            params.rotationBegin = this.rotation;
            params.rotationDelta = keepOrientation ? 0 : -this.rotation;
        });
        downAnimation.onUpdate(onUpdate);
        downAnimation.onEnd((params) => {
            this.position = [params.end[0], params.end[1], params.end[2]];
            this.boardPosition = endBoardPosition;
            this.rotation = keepOrientation ? this.rotation : 0;
        });

        if (this.topOffset > this.DEFAULT_TOP_OFFSET) {
            return [upAnimation, downAnimation, this.getChangeHeightAnimation(this.DEFAULT_TOP_OFFSET)];
        }
        
        if (keepOrientation && this.rotation === 0.5) {
            return [upAnimation, downAnimation, this.getChangeHeightAnimation(1)];
        }

        return [upAnimation, downAnimation];
    }

    animateUndo(move, updateScore, onEndCallback) {
        const endPosition = this.calculatePosition(move.from);

        const deltaPosition = [endPosition[0] - this.position[0], endPosition[2] - this.position[2]];
        const absDelta = Math.abs(deltaPosition[0]) / this.tileSize;
        const direction = [deltaPosition[0] / absDelta, deltaPosition[1] / absDelta];

        const animations = new EventAnimationChain();
        if (move.promoted) {
            animations.push(...this.getPromotionAnimations(true));
        }
        animations.push(...this.getMoveAnimations(direction, endPosition));
        if (move.captured) {
            const opponent = this.model.getOpponentId(this.player.getId());
            const capturedPiece = this.scene.game.getDiscardBoard(opponent).takePiece();
            const endBoardPosition = [move.captured[0], move.captured[1]];
            const endPosition = this.calculatePosition(endBoardPosition);
            animations.push(...capturedPiece.getJumpAnimations(endPosition, endBoardPosition, updateScore));
        }
        
        animations.onEnd(() => {
            this.setPosition(move.from);
            onEndCallback();
        });
        animations.start(this.scene.currentTime);
    }

    animateMove(move, updateScore, onEndCallback) {
        const endPosition = this.calculatePosition(move.to);

        const deltaPosition = [endPosition[0] - this.position[0], endPosition[2] - this.position[2]];
        const absDelta = Math.abs(deltaPosition[0]) / this.tileSize;
        const direction = [deltaPosition[0] / absDelta, deltaPosition[1] / absDelta];
        
        let onTestCollision = null;
        if (move.captured) {
            const capturedPiece = this.scene.game.getChecker(move.captured[0], move.captured[1]);

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

                    const discardSlot = this.scene.game.getDiscardBoard(capturedPiece.player.getId()).putPiece(capturedPiece);

                    const animations = new EventAnimationChain();
                    animations.push(...this.getRecoilAnimations(capturedPiece, direction));
                    animations.push(...capturedPiece.getJumpAnimations(discardSlot, null, updateScore));
                    animations.push(...this.getMoveAnimations(direction, endPosition));
                    
                    if (move.promoted) {
                        animations.push(...this.getPromotionAnimations());
                    }
                    animations.onEnd(() => {
                        this.setPosition(move.to);
                        onEndCallback();
                    });
                    
                    const insideTime = insideDistance / this.MAX_MOVE_1D_VELOCITY;
                    animations.start(this.scene.currentTime - insideTime);
                }
            }
        }

        const animations = new EventAnimationChain();
        animations.push(...this.getMoveAnimations(direction, endPosition, onTestCollision));
        if (move.promoted) {
            animations.push(...this.getPromotionAnimations());
        }
        animations.onEnd(() => {
            this.setPosition(move.to);
            onEndCallback();
        });
        animations.start(this.scene.currentTime);
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
        
        this.scene.translate(this.position[0], this.position[1] + (this.rotation == 0 ? this.height : 0), this.position[2]);
        this.scene.rotate(this.rotation * Math.PI * 2, 0, 0, 1);
        this.scene.rotate(this.rotation * Math.PI * 2, 0, 1, 0);

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
