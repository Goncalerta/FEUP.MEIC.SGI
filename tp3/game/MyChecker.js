import { CGFobject } from '../../lib/CGF.js';
import { easeOutCubic, easeInCubic, identity, easeInQuad, easeOutQuad } from '../animations/EasingFunctions.js';
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
    PROMOTION_HEIGHT = 2.5;
    PROMOTION_FULL_TURNS = 1;

    /**
     * @constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {Object} geometries - Array of geometries
     * @param {Object} materials - Array of materials
     * @param {Object} textures - Array of textures
     * @param {MyGameModel} model - MyGameModel object
     * @param {Number} pickingId - Picking ID
     * @param {Number} tileSize - Size of a tile
     * @param {Number} radius - Radius of the checker
     * @param {Number} height - Height of the checker
     * @param {Player} player - Player that owns the checker
     * @param {Array} position - Position of the checker on the board
     * @param {Number} topOffset - Offset of the checker
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
        this.rotationDirection = null;

        this.topOffset = topOffset;
    }

    /**
     * Calculates the position of the checker
     * @param {Array} position - Position of the checker on the board
     * @returns {Array} Position of the checker
     */
    calculatePosition(position) {
        return [(position[0] - 3.5) * this.tileSize, 0, -(position[1] - 3.5) * this.tileSize];
    }

    /**
     * Sets the position of the checker
     * @param {Array} position - Position of the checker on the board
     */
    setPosition(position) {
        this.position = this.calculatePosition(position);
        this.boardPosition = position;
    }

    /**
     * Animates the cheker for being an unallowed move
     */
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

    /**
     * Gets the animation for a promotion
     * @param {Boolean} reversed - If the animation should be reversed
     * @returns {Array} Array of animations
     */
    getPromotionAnimations(reversed = false) {
        const halfDuration = 1;
        const heightToTurn = this.PROMOTION_HEIGHT - this.radius;

        const upAnimation = new EventAnimation(this.scene, halfDuration, easeOutQuad);
        upAnimation.onUpdate((t) => {
            this.position[1] = this.PROMOTION_HEIGHT * t;
            if (reversed) {
                this.topOffset = Math.max(1 - t, this.DEFAULT_TOP_OFFSET);
            }

            if (this.position[1] > this.radius) {
                const percentage = (this.position[1] - this.radius) / heightToTurn;
                this.rotation = percentage * (this.PROMOTION_FULL_TURNS + 0.5);
                if (reversed) {
                    this.rotation += (1 - t) * 0.5;
                }
            }
        });
        upAnimation.onEnd(() => {
            this.position[1] = this.PROMOTION_HEIGHT;
            this.rotation = this.PROMOTION_FULL_TURNS + 0.5;
        });

        const downAnimation = new EventAnimation(this.scene, halfDuration, easeInQuad);
        downAnimation.onUpdate((t) => {
            this.position[1] = this.PROMOTION_HEIGHT * (1 - t);
            if (!reversed) {
               this.topOffset = Math.max(t, this.DEFAULT_TOP_OFFSET);
            }

            if (this.position[1] > this.radius) {
                const percentage = (this.position[1] - this.radius) / heightToTurn;
                this.rotation = percentage * (this.PROMOTION_FULL_TURNS + 0.5);
                if (!reversed) {
                    this.rotation += t * 0.5;
                }
            }
        });
        downAnimation.onEnd(() => {
            this.position[1] = 0;
            this.rotation = reversed? 0 : 0.5;
            this.topOffset = reversed? this.DEFAULT_TOP_OFFSET : 1;
        });

        return [upAnimation, downAnimation];
    }

    /**
     * Gets the animation for a move
     * @param {Array} direction - Direction of the move
     * @param {Array} endPosition - End position of the move
     * @param {Function} onTestCollision - Function to test collision
     * @returns {Array} Array of animations
     */
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

    /**
     * Gets the animations for a recoil (when a piece goes against another during a move)
     * @param {MyChecker} capturedPiece - Piece that is captured
     * @param {Array} direction - Direction of the move
     * @returns {Array} Array of animations
     */
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
        });

        return [recoilAnimation];
    }

    /**
     * Gets the animation for a change in height
     * @param {number} finalHeight - Final height of the piece
     * @returns {EventAnimation} Animation for the change in height
     */
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

    /**
     * Gets the animations for a jump
     * @param {Array} endPosition - Final position of the piece
     * @param {Array} endBoardPosition - Final board position of the piece
     * @param {Function} onStart - Function to be called when the animation starts
     * @param {boolean} keepPromotion - Whether to keep the promotion or not
     * @returns {Array} Array of animations
     */
    getJumpAnimations(endPosition, endBoardPosition, onStart = null, keepPromotion = true) {
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
            params.rotationDelta = keepPromotion ? 0 : -this.rotation / 2;
            if (params.rotationDelta !== 0) {
                const orthogonal = [-params.delta[2], 0, params.delta[0]];
                if (orthogonal[0] !== 0) {
                    orthogonal[0] = Math.abs(orthogonal[0])/orthogonal[0];
                }
                if (orthogonal[2] !== 0) {
                    orthogonal[2] = Math.abs(orthogonal[2])/orthogonal[2];
                }
                if (orthogonal[0] !== 0 || orthogonal[2] !== 0) {
                    this.rotationDirection = orthogonal;
                }
            }
        });
        upAnimation.onUpdate(onUpdate);
        upAnimation.onEnd((params) => {
            this.position = [params.end[0], params.end[1], params.end[2]];
        });
        const downAnimation = new EventAnimation(this.scene, 0.5, [identity, easeInQuad]);
        downAnimation.onStart((params) => {
            params.begin = [this.position[0], this.position[1], this.position[2]];
            params.end = [endPosition[0], endPosition[1] * (this.height + 0.001), endPosition[2]];
            params.delta = [params.end[0] - params.begin[0], params.end[1] - params.begin[1], params.end[2] - params.begin[2]];
            params.rotationBegin = this.rotation;
            params.rotationDelta = keepPromotion ? 0 : -this.rotation;
        });
        downAnimation.onUpdate(onUpdate);
        downAnimation.onEnd((params) => {
            this.position = [params.end[0], params.end[1], params.end[2]];
            this.boardPosition = endBoardPosition;
            this.rotation = keepPromotion ? this.rotation : 0;
            this.rotationDirection = null;
        });

        if (this.topOffset > this.DEFAULT_TOP_OFFSET) {
            if (keepPromotion) {
                return [upAnimation, downAnimation, this.getChangeHeightAnimation(this.DEFAULT_TOP_OFFSET)];
            } else {
                return [this.getChangeHeightAnimation(this.DEFAULT_TOP_OFFSET), upAnimation, downAnimation];
            }
        }
        
        if (keepPromotion && this.rotation === 0.5) {
            return [upAnimation, downAnimation, this.getChangeHeightAnimation(1)];
        }

        return [upAnimation, downAnimation];
    }

    /**
     * Animates an undo operation
     * @param {Move} move - Move to be undone
     * @param {Function} updateScore - Function to update the score
     * @param {Function} onEndCallback - Function to be called when the animation ends
     */
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

    /**
     * Animates a move operation
     * @param {Move} move - Move to be animated
     * @param {Function} updateScore - Function to update the score
     * @param {Function} onEndCallback - Function to be called when the animation ends
     */
    animateMove(move, updateScore, onEndCallback) {
        const endPosition = this.calculatePosition(move.to);

        const deltaPosition = [endPosition[0] - this.position[0], endPosition[2] - this.position[2]];
        const absDelta = Math.abs(deltaPosition[0]) / this.tileSize;
        const direction = [deltaPosition[0] / absDelta, deltaPosition[1] / absDelta];
        
        let onTestCollision = null;
        if (move.captured) {
            const capturedPiece = this.scene.game.getChecker(move.captured[0], move.captured[1]);

            onTestCollision = (animation) => {
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

    /**
     * Checks if the checker is a queen
     * @returns {boolean} True if the checker is a queen, false otherwise
     */
    isQueen() {
        return this.rotation > 0.25;
    }

    /**
     * Method called when the checker is clicked
     */
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
        
        this.scene.translate(0, this.height * (1 + this.topOffset) / 2, 0);
        this.scene.translate(this.position[0], this.position[1], this.position[2]);
        if (this.rotationDirection) {
            this.scene.rotate(this.rotation * Math.PI * 2, this.rotationDirection[0], this.rotationDirection[1], this.rotationDirection[2]);
        } else {
            this.scene.rotate(this.rotation * Math.PI * 2, 0, 0, 1);
            this.scene.rotate(this.rotation * Math.PI * 2, 0, 1, 0);
        }
        this.scene.translate(0, this.height * (1 + this.topOffset) / 2, 0);
        

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
