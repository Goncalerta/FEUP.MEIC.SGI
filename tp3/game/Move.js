/**
 * Move class, represents a move from a position to another.
 */
export class Move {
    /**
     * @constructor
     * @param {Array} from - The move origin
     * @param {Array} to - The move destination
     */
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
}

/**
 * CompletedMove class, represents a completed move.
 */
export class CompletedMove extends Move {
    /**
     * @constructor
     * @param {Array} from - The move origin
     * @param {Array} to - The move destination
     * @param {number} by - The player id
     * @param {boolean} captured - Did the move capture a piece?
     * @param {boolean} promoted - Did the move promote a piece?
     * @param {boolean} multicapture - Is the player capturing multiple pieces?
     * @param {number} consecutiveQueenMoves - Number of consecutive queen moves without captures
     */
    constructor(from, to, by, captured = null, promoted = false, multicapture = false, consecutiveQueenMoves = 0) {
        super(from, to);
        this.by = by;
        this.captured = captured;
        this.promoted = promoted;
        this.multicapture = multicapture;
        this.consecutiveQueenMoves = consecutiveQueenMoves;
    }

    /**
     * Gets the next player id.
     * @returns {number} - The next player id
     */
    nextPlayerId() {
        if (this.captured) {
            return this.by;
        }

        return this.by === 1? 2 : 1;
    }
}
