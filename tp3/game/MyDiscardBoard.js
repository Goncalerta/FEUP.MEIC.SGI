import { CGFtexture } from '../../lib/CGF.js';
import { MyPatch } from '../MyPatch.js';
import { getAppearance } from '../utils.js';

/**
 * MyDiscardBoard class, representing a discard board.
 */
export class MyDiscardBoard {
    TEXTURE_PATH = "scenes/images/game/discardboard.png";
    MATERIAL = {
        shininess: 10,
        emission: [0.3, 0.24, 0.24, 1.0],
        ambient: [0.7, 0.6, 0.6, 1.0],
        diffuse: [0.9, 0.7, 0.7, 1.0],
        specular: [0.8, 0.6, 0.6, 1.0],
    };

    /**
     * @constructor
     * @param scene Reference to MyScene object.
     * @param realHalfSize Half size of the board
     * @param width Width of the board
     * @param position Position of the board
     * @param direction Direction of the board
     * @param padding Padding between pieces
     */
     constructor(scene, realHalfSize, width, position, direction = 1, padding = 0.5) {
        this.scene = scene;
        this.position = position;
        this.texture = new CGFtexture(scene, this.TEXTURE_PATH);
        this.material = getAppearance(scene, this.MATERIAL, this.texture);

        const controlPoints = [
            [
                [realHalfSize, 0, 0, 1],
                [realHalfSize, 0, direction * width, 1],
            ],
            [
                [-realHalfSize, 0, 0, 1],
                [-realHalfSize, 0, direction * width, 1],
            ],
        ];
        
        if (direction === 1) {
            this.geometry = new MyPatch(scene, 1, 20, 1, 20, [controlPoints[0], controlPoints[1]]);
        } else {
            this.geometry = new MyPatch(scene, 1, 20, 1, 20, [controlPoints[1], controlPoints[0]]);
        }

        this.pieces = [];
        this.emptySlots = [];
        this.occupiedSlots = [];
        const step = 2 * (realHalfSize - padding) / 5 // five gaps to fit six pieces
        const z = position[2] + direction * width / 2;
        for (let y = 1; y >= 0; y--) { // y represents height level, not absolute position
            for (let x = position[0] + 2.5 * step; x >= position[0] - 2.5 * step; x -= step) {
                this.emptySlots.push([x, y, z]);
            }
        }
    }

    /**
     * Adds a piece to the board.
     * @param {MyChecker} piece Piece to be added.
     * @returns {Array} Position of the piece.
     */
    putPiece(piece) {
        const slot = this.emptySlots.pop();
        this.occupiedSlots.push(slot);
        this.pieces.push(piece);
        return slot;
    }

    /**
     * Removes a piece from the board.
     * @returns {MyChecker} Piece removed.
     */
    takePiece() {
        const slot = this.occupiedSlots.pop();
        this.emptySlots.push(slot);
        return this.pieces.pop();
    }

    /**
     * Removes all pieces from the board.
     * @returns {Array} Pieces removed.
     */
    takeAllPieces() {
        const pieces = this.pieces.reverse();
        this.pieces = [];
        this.emptySlots = this.emptySlots.concat(this.occupiedSlots.reverse());
        this.occupiedSlots = [];
        return pieces;
    }

    /**
     * Displays the board.
     */
    display() {
        this.material.apply();
        this.scene.pushMatrix();
        this.scene.translate(...this.position);
        this.geometry.display();
        this.scene.popMatrix();
    }
}
