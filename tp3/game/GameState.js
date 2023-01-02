import { EventAnimationChain } from "../animations/EventAnimationChain.js";
import { arraysIncludes } from "../utils.js";
import { MyChecker } from "./MyChecker.js";

/**
 * Represents a generic game state.
 */
class GameState {
    MAX_CYCLIC_MOVES = 20;

    /**
     * @constructor
     * @param {GameModel} model - Reference to the game model.
     */
    constructor(model) {
        this.model = model;
    }

    /**
     * Updates the game state.
     * @param {Number} t - Current time.
     */
    update(t) {}

    /**
     * Gets the selected piece.
     * @returns {MyChecker|null} Selected piece.
     */
    getSelectedPiece() {
        return null;
    }

    /**
     * Gets the move hints.
     * @returns {Array} Move hints.
     */
    getMoveHints() {
        return [];
    }

    /**
     * Gets the highlighted pieces.
     * @returns {Array} Highlighted pieces.
     */
    getHighlightedPieces() {
        return [];
    }

    /**
     * Selects a piece.
     * @param {MyChecker} piece - Piece to be selected.
     * @param {Number} x - Piece's x coordinate.
     * @param {Number} y - Piece's y coordinate.
     */
    selectPiece(piece, x, y) {}

    /**
     * Selects a tile.
     * @param {Number} x - Tile's x coordinate.
     * @param {Number} y - Tile's y coordinate.
     */
    selectTile(x, y) {}

    /**
     * Gets the current player.
     * @returns {Player|null} Current player.
     */
    getCurrentPlayer() {
        return null;
    }

    /**
     * Gets the current spotlight position.
     * @returns {Array|null} Spotlight position.
     */
    spotlightOn() {
        return null;
    }

    /**
     * Gets the round remaining time.
     * @returns {Number|null} Round remaining time.
     */
    getRemainingTime() {
        return null;
    }

    /**
     * Checks if the game time should be increased.
     * @returns {Boolean} True if the game time should be increased, false otherwise.
     */
    increaseGameTime() {
        return false;
    }

    /**
     * Trigger the undo.
     * @param {Function} getChecker - Function to get a checker.
     */
    triggerUndo(getChecker) {}

    /**
     * Trigger the replay.
     * @param {Function} getChecker - Function to get a checker.
     */
    triggerReplay(getChecker) {}
}

/**
 * PlayerTurnState class, represents a player turn.
 */
export class PlayerTurnState extends GameState {
    static TURN_TIME_LIMIT = 300;
    static ONE_MOVE_TIME_LIMT = 60;

    /**
     * @constructor
     * @param {GameModel} model - Reference to the game model.
     * @param {Player} player - Current player.
     * @param {Number} startTime - Turn start time.
     * @param {Number} t - Current time.
     * @param {Array} validMoves - Valid moves.
     * @param {Number} turn_time_limit - Turn time limit.
     */
    constructor(model, player, startTime, t = null, validMoves = null, turn_time_limit=null) {
        super(model);
        this.player = player;

        this.validMoves = validMoves? validMoves : this.model.getValidMoves(this.player.getId());
        this.validMovesPieces = [];
        for (let move of this.validMoves) {
            if (!this.validMovesPieces.some(piece => piece[0] == move.from[0] && piece[1] == move.from[1])) {
                this.validMovesPieces.push(move.from);
            }
        }

        this.start_time = startTime;
        if (turn_time_limit !== null) {
            this.turn_time_limit = turn_time_limit;
        } else if (this.validMoves.length == 1) {
            this.turn_time_limit = PlayerTurnState.ONE_MOVE_TIME_LIMT;
        } else {
            this.turn_time_limit = PlayerTurnState.TURN_TIME_LIMIT;
        }
        this.update(t !== null? t : startTime);
    }

    selectPiece(piece, x, y) {
        if (this.model.getPlayerId(x, y) !== this.player.getId()) {
            return;
        }

        const filteredValidMoves = this.validMoves.filter(move => move.from[0] == x && move.from[1] == y);

        if (filteredValidMoves.length == 0) {
            piece.animateUnallowed();
            return;
        }

        this.model.setGameState(new PieceSelectedState(this.model, this.player, this.start_time, this.model.current_time, this.validMoves, filteredValidMoves, piece, [x, y], this.turn_time_limit));
    }

    update(t) {
        this.remaining_time = Math.max(0, this.turn_time_limit - (t - this.start_time) / 1000);
        if (this.remaining_time == 0) {
            this.model.setGameState(new GameOverState(this.model, this.model.getOpponent(this.player)))
        }
    }

    getHighlightedPieces() {
        return this.validMovesPieces;
    }

    getCurrentPlayer() {
        return this.player;
    }

    getRemainingTime() {
        return Math.ceil(this.remaining_time);
    }

    increaseGameTime() {
        return true;
    }

    triggerUndo(getChecker) {
        const completedMove = this.model.undo();
        if (!completedMove) {
            return;
        }
        const piece = getChecker(...completedMove.to);
        this.model.setGameState(new PieceMovingUndoState(this.model, this.player, completedMove, piece, this.remaining_time));
    }

    triggerReplay(getChecker) {
        const moves = this.model.prepareFilm();
        if (moves.length == 0) {
            return;
        }
        this.model.setGameState(new BeginFilmState(this.model, moves, getChecker, this.remaining_time));
    }
}

/**
 * PieceSelectedState class, represents the state where a player has selected a piece.
 */
export class PieceSelectedState extends PlayerTurnState {
    /**
     * @constructor
     * @param {GameModel} model - Reference to the game model.
     * @param {Player} player - Current player.
     * @param {Number} startTime - Turn start time.
     * @param {Number} t - Current time.
     * @param {Array} validMoves - Valid moves.
     * @param {Array} filteredValidMoves - Valid moves for the selected piece.
     * @param {MyChecker} piece - Selected piece.
     * @param {Array} piecePosition - Selected piece position.
     * @param {Number} turn_time_limit - Turn time limit.
     */
    constructor(model, player, startTime, t, validMoves, filteredValidMoves, piece, piecePosition, turn_time_limit=null) {
        super(model, player, startTime, t, validMoves, turn_time_limit);
        this.piece = piece;
        this.piecePosition = piecePosition;
        if (filteredValidMoves) {
            this.filteredValidMoves = filteredValidMoves;
        } else {
            const x = this.piece.boardPosition[0];
            const y = this.piece.boardPosition[1];
            this.filteredValidMoves = this.validMoves.filter(move => move.from[0] == x && move.from[1] == y);
        }
    }

    selectPiece(piece, x, y) {
        if (x == this.piecePosition[0] && y == this.piecePosition[1]) {
            this.model.setGameState(new PlayerTurnState(this.model, this.player, this.start_time, this.model.current_time, this.validMoves, this.turn_time_limit));
            return;
        }

        if (this.model.getPlayerId(x, y) === this.player.getId()) {
            super.selectPiece(piece, x, y);
        } else {
            this.selectTile(x, y);
        }
    }

    selectTile(x, y) {
        const move = this.filteredValidMoves.find(move => move.to[0] == x && move.to[1] == y);
        if (move) {
            const completedMove = this.model.move(move);
            this.model.setGameState(new PieceMovingState(this.model, this.player, completedMove, this.piece, this.getRemainingTime()));
        } else {
            this.piece.animateUnallowed();
            this.model.game.makeCross(x, y);
            this.model.setGameState(new PlayerTurnState(this.model, this.player, this.start_time, this.model.current_time, null, this.turn_time_limit));
        }
    }

    getSelectedPiece() {
        return this.piece;
    }

    getHighlightedPieces() {
        return this.validMovesPieces;
    }

    getMoveHints() {
        return this.filteredValidMoves.map(move => move.to);
    }

    getCurrentPlayer() {
        return this.player;
    }
}

/**
 * AnimationState class.
 * Represents the state where a piece is moving (both normally and when undoing).
 */
export class AnimationState extends GameState {
    /**
     * @constructor
     * @param {GameModel} model - Reference to the game model.
     * @param {Player} player - Current player.
     * @param {Move} completedMove - Completed move.
     * @param {MyChecker} piece - Moving piece.
     * @param {Number} remaining_time - Remaining time.
     */
    constructor(model, player, completedMove, piece, remaining_time) {
        super(model);
        this.player = player;
        this.completedMove = completedMove;
        this.remaining_time = remaining_time;
        this.piece = piece;
    }

    getCurrentPlayer() {
        return this.player;
    }

    spotlightOn() {
        return [this.piece.position[0], this.piece.position[2]];
    }

    getRemainingTime() {
        return Math.ceil(this.remaining_time);
    }

    increaseGameTime() {
        return true;
    }
}

/**
 * PieceMovingUndoState class, represents the state where a piece is moving.
 */
export class PieceMovingState extends AnimationState {
    /**
     * @constructor
     * @param {GameModel} model - Reference to the game model.
     * @param {Player} player - Current player.
     * @param {Move} completedMove - Completed move.
     * @param {MyChecker} piece - Moving piece.
     * @param {Number} remaining_time - Remaining time.
     */
    constructor(model, player, completedMove, piece, remaining_time) {
        super(model, player, completedMove, piece, remaining_time);

        this.piece.animateMove(
            completedMove, 
            () => this.model.getPlayer(this.completedMove.by).changeScore(1),
            () => {
                // Check for multicapture
                if ((!completedMove.promoted) && completedMove.captured) {
                    const captureMoves = this.model.getValidMovesFor(this.completedMove.to[0], this.completedMove.to[1])[0];
                    if (captureMoves.length > 0) {
                        this.model.setGameState(new PieceSelectedState(this.model, this.player, this.model.current_time, null, captureMoves, captureMoves, this.piece, this.completedMove.to, this.remaining_time));
                        return;
                    }
                }

                let nextState = new PlayerTurnState(this.model, this.model.getOpponent(this.player), this.model.current_time);

                // Check for game over
                if (nextState.validMoves.length === 0) {
                    nextState = new GameOverState(this.model, this.player);
                } else if (completedMove.consecutiveQueenMoves >= this.MAX_CYCLIC_MOVES) {
                    nextState = new GameOverState(this.model, null);
                }

                this.model.setGameState(nextState);
            },
        );
    }

    getHighlightedPieces() {
        return [this.completedMove.from];
    }
}

/**
 * PieceMovingUndoState class, represents the state where a piece is moving when undoing.
 */
export class PieceMovingUndoState extends AnimationState {
    /**
     * @constructor
     * @param {GameModel} model - Reference to the game model.
     * @param {Player} player - Current player.
     * @param {Move} completedMove - Completed move.
     * @param {MyChecker} piece - Moving piece.
     * @param {Number} remaining_time - Remaining time.
     * @param {Number} turn_time_limit - Turn time limit.
     */
    constructor(model, player, completedMove, piece, remaining_time) {
        super(model, player, completedMove, piece, remaining_time);

        const movePlayer = this.model.getPlayer(this.completedMove.by)
        this.piece.animateUndo(
            completedMove, 
            () => movePlayer.changeScore(-1),
            () => {
                if (this.completedMove.multicapture) {
                    const captureMoves = this.model.getValidMovesFor(this.completedMove.from[0], this.completedMove.from[1])[0];
                    this.model.setGameState(new PieceSelectedState(this.model, movePlayer, this.model.current_time, null, captureMoves, captureMoves, this.piece, completedMove.from, this.remaining_time));
                } else {
                    const remainingTime = this.player === movePlayer ? this.remaining_time : null;
                    this.model.setGameState(new PieceSelectedState(this.model, movePlayer, this.model.current_time, null, null, null, this.piece, completedMove.from, remainingTime));
                }
            },
        );
    }

    getHighlightedPieces() {
        return [this.completedMove.to];
    }
}

/**
 * BeginFilmState class, represents the state where the game film will begin.
 */
export class BeginFilmState extends GameState {
    /**
     * @constructor
     * @param {GameModel} model - Reference to the game model.
     * @param {Array} moves - Array of moves.
     * @param {Function} getChecker - Function to get a checker.
     * @param {Number} remainingTime - Remaining time.
     */
    constructor(model, moves, getChecker, remainingTime = null) {
        super(model);
        this.moves = moves;
        this.getChecker = getChecker;
        this.remainingTime = remainingTime;

        const animations = new EventAnimationChain();

        const [player1_positions, player2_positions] = this.initPositions();
        const next_player1_positions = [...player1_positions];
        const next_player2_positions = [...player2_positions];

        const pieces = [];
        pieces.push(...this.model.game.player1DiscardBoard.takeAllPieces());
        pieces.push(...this.model.game.player2DiscardBoard.takeAllPieces());
        // There will be repeated pieces but that is fine; it's more efficient
        // to iterate twice than to check for duplicates.
        pieces.push(...this.model.game.checkers.pieces);

        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i];
            const player = piece.player;
            const player_positions = player.getId() === 1 ? player1_positions : player2_positions;
            const next_player_positions = player.getId() === 1 ? next_player1_positions : next_player2_positions;
            
            if (arraysIncludes(player_positions, piece.boardPosition)) {
                if (piece.isQueen()) {
                    animations.push(...piece.getJumpAnimations([...piece.position], [...piece.boardPosition], null, false));
                }
                continue;
            }

            while (true) {
                const position = next_player_positions.shift();
                const other = getChecker(...position);

                if (other && other.player === piece.player) {
                    continue;
                }

                if (other && other.player !== piece.player) {
                    const dx = piece.player.getId() === 1 ? 1 : -1;
                    const direction = [dx * piece.tileSize, 0];
                    const adjacentPosition = [position[0] + dx, position[1]];
                    other.boardPosition = adjacentPosition;
                    animations.push(...other.getMoveAnimations(direction, piece.calculatePosition(adjacentPosition)));
                }

                piece.boardPosition = position;
                animations.push(...piece.getJumpAnimations(piece.calculatePosition(position), position, null, false));
                break;
            }
        }

        animations.onEnd(() => {
            this.model.setGameState(new FilmState(this.model, this.moves, this.getChecker, this.remainingTime));
        });

        animations.start(this.model.current_time);
    }

    /**
     * Initializes the positions of the pieces.
     * @returns {Array} Array with the positions of the pieces.
     */
    initPositions() {
        const player1_positions = [];
        const player2_positions = [];

        for (let i = 0; i < this.model.BOARD_SIZE; i++) {
            for (let j = 0; j < this.model.BOARD_SIZE; j++) {
                if (i % 2 != j % 2) {
                    continue;
                }
                
                if (i < 3) {
                    player1_positions.push([j, i]);
                } else if (i > 4) {
                    player2_positions.push([j, i]);
                }
            }
        }

        return [player1_positions, player2_positions];
    }
}

/**
 * FilmState class, represents the state where the game film is being played.
 */
export class FilmState extends GameState {
    /**
     * @constructor
     * @param {GameModel} model - Reference to the game model.
     * @param {Array} moves - Array of moves.
     * @param {Function} getChecker - Function to get a checker.
     * @param {Number} remainingTime - Remaining time.
     */
    constructor(model, moves, getChecker, remainingTime = null) {
        super(model);
        this.moves = moves;
        this.getChecker = getChecker;
        this.moveIndex = -1;
        this.nextMove();
        this.remainingTime = remainingTime;

        this.animateMove();
    }

    /**
     * Advances to the next move to be played.
     */
    nextMove() {
        this.moveIndex += 1;
        this.currentMove = this.moves[this.moveIndex];
        this.piece = this.getChecker(...this.currentMove.from);
        this.player = this.model.getPlayer(this.currentMove.by);
    }

    /**
     * Animates the current move.
     */
    animateMove() {
        if (this.moveIndex < this.moves.length - 1) {
            this.piece.animateMove(
                this.currentMove,
                () => this.player.changeScore(1),
                () => {
                    this.nextMove();
                    this.animateMove();
                },
            );
        } else {
            this.piece.animateMove(
                this.currentMove,
                () => this.player.changeScore(1),
                () => {
                    // Check for multicapture
                    if ((!this.currentMove.promoted) && this.currentMove.captured) {
                        const captureMoves = this.model.getValidMovesFor(this.currentMove.to[0], this.currentMove.to[1])[0];
                        if (captureMoves.length > 0) {
                            this.model.setGameState(new PieceSelectedState(this.model, this.player, this.model.current_time, null, captureMoves, captureMoves, this.piece, this.currentMove.to, this.remainingTime));
                            return;
                        }
                    }
    
                    let nextState = new PlayerTurnState(this.model, this.model.getOpponent(this.player), this.model.current_time, null, null, this.remainingTime);
    
                    // Check for game over
                    if (this.remainingTime === 0 || nextState.validMoves.length === 0) {
                        nextState = new GameOverState(this.model, this.player);
                    } else if (this.currentMove.consecutiveQueenMoves >= this.MAX_CYCLIC_MOVES) {
                        nextState = new GameOverState(this.model, null);
                    }

                    this.model.setGameState(nextState);
                },
            );
        }
    }

    getCurrentPlayer() {
        return this.player;
    }

    spotlightOn() {
        return [this.piece.position[0], this.piece.position[2]];
    }

    getHighlightedPieces() {
        return [this.currentMove.from];
    }
}

/**
 * GameOverState class, represents the state where the game is over.
 * A player has won or the game has ended in a draw.
 */
export class GameOverState extends GameState {
    /**
     * @constructor
     * @param {GameModel} model - Reference to the game model.
     * @param {Player|null} winner - The winner of the game.
     */
    constructor(model, winner) {
        super(model);
        this.winner = winner;
        this.win_time = model.current_time;
    }

    /**
     * Returns the winner of the game.
     * @returns {Player|null} The winner of the game.
     */
    getWinner() {
        return this.winner;
    }

    triggerUndo(getChecker) {
        const completedMove = this.model.undo();
        if (!completedMove) {
            return;
        }
        const piece = getChecker(...completedMove.to);
        this.model.setGameState(new PieceMovingUndoState(this.model, this.player, completedMove, piece, 0));
    }

    triggerReplay(getChecker) {
        const moves = this.model.prepareFilm();
        if (moves.length == 0) {
            return;
        }
        this.model.setGameState(new BeginFilmState(this.model, moves, getChecker, 0));
    }
}
