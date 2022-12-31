import { EventAnimationChain } from "../animations/EventAnimationChain.js";
import { arraysIncludes } from "../utils.js";

class GameState {
    constructor(model) {
        this.model = model;
    }

    update(t) {}

    getSelectedPiece() {
        return null;
    }

    getMoveHints() {
        return [];
    }

    getHighlightedPieces() {
        return [];
    }

    selectPiece(piece, x, y) {}

    selectTile(x, y) {}

    getCurrentPlayer() {
        return null;
    }

    spotlightOn() {
        return null;
    }

    getRemainingTime() {
        return null;
    }

    getGameTime() {
        return this.model.current_time;
    }

    triggerUndo(getChecker) {}

    triggerReplay(getChecker) {}
}

export class PlayerTurnState extends GameState {
    static TURN_TIME_LIMIT = 300;
    static ONE_MOVE_TIME_LIMT = 60;

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
        this.remaining_time = Math.max(0, this.turn_time_limit - Math.floor((t - this.start_time) / 1000));
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
        return this.remaining_time;
    }

    triggerUndo(getChecker) {
        const completedMove = this.model.undo();
        if (!completedMove) {
            return; // TODO should we give any feedback?
        }
        const piece = getChecker(...completedMove.to);
        this.model.setGameState(new PieceMovingUndoState(this.model, this.player, completedMove, piece, this.remaining_time));
    }

    triggerReplay(getChecker) {
        const moves = this.model.undoAll();
        if (moves.length == 0) {
            return; // TODO should we give any feedback?
        }
        this.model.setGameState(new BeginFilmState(this.model, moves, getChecker));
    }
}

export class PieceSelectedState extends PlayerTurnState {
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
            this.player.changeCumulativeTime((this.model.current_time - this.start_time) / 1000);
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

export class AnimationState extends GameState {
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
        return this.remaining_time;
    }
}

export class PieceMovingState extends AnimationState {
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
                }

                this.model.setGameState(nextState);
            },
        );
    }

    getHighlightedPieces() {
        return [this.completedMove.from];
    }
}

export class PieceMovingUndoState extends AnimationState {
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

export class BeginFilmState extends GameState {
    constructor(model, moves, getChecker) {
        super(model);
        this.moves = moves;
        this.getChecker = getChecker;

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
                continue;
            }

            while (true) {
                const position = next_player_positions.shift();
                const other = getChecker(...position);

                // console.log(position, other.player, piece.player, other.player === piece.player)

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
                animations.push(...piece.getJumpAnimations(piece.calculatePosition(position), position, null, true));
                break;
            }
        }

        animations.start(this.model.current_time);
    }

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

export class GameOverState extends GameState {
    constructor(model, winner) {
        super(model);
        this.winner = winner;
        this.win_time = model.current_time;
        console.log("winner detected: TODO winning", winner);
    }

    getGameTime() {
        return this.win_time;
    }
}
