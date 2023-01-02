import { PlayerTurnState } from "./GameState.js";
import { CompletedMove, Move } from "./Move.js";

/**
 * TileState enum, represents the state of a tile.
 */
const TileState = {
    WHITE: -1,
    EMPTY: 0,
    PLAYER_1: 1,
    PLAYER_2: 2,
    PLAYER_1_QUEEN: 3,
    PLAYER_2_QUEEN: 4,
};

/**
 * P1_FORWARD_DIRECTIONS constant, represents the forward directions for player 1.
 */
const P1_FORWARD_DIRECTIONS = [[1, 1], [-1, 1]];

/**
 * P2_FORWARD_DIRECTIONS constant, represents the forward directions for player 2.
 */
const P2_FORWARD_DIRECTIONS = [[1, -1], [-1, -1]];

/**
 * GameModel class, represents the game model.
 */
export class GameModel {
    BOARD_SIZE = 8;
    
    /**
     * @constructor
     * @param {MyGame} game Reference to MyGame object.
     * @param {Number} startTime The start time of the game.
     * @param {Player} player1 Player 1.
     * @param {Player} player2 Player 2.
     */
    constructor(game, startTime, player1, player2) {
        this.game = game;
        this.initBoard();

        this.player1 = player1;
        this.player2 = player2;

        this.state = new PlayerTurnState(this, this.player1, startTime);

        this.current_time = startTime;
        this.gameTime = 0;
        this.previousMoves = [];
        this.nextMoves = [];
    }

    /**
     * Gets the current game time.
     * @returns {Number} The current game time.
     */
    getGameTime() {
        return Math.floor(this.gameTime);
    }

    /**
     * Executes a completed move.
     * @param {CompletedMove} completedMove The completed move.
     */
    executeMove(completedMove) {
        if (completedMove.promoted) {
            this.board[completedMove.to[1]][completedMove.to[0]] = this.getPlayerQueen(completedMove.by);
        } else {
            this.board[completedMove.to[1]][completedMove.to[0]] = this.board[completedMove.from[1]][completedMove.from[0]];
        }
        
        this.board[completedMove.from[1]][completedMove.from[0]] = TileState.EMPTY;

        if (completedMove.captured) {
            this.board[completedMove.captured[1]][completedMove.captured[0]] = TileState.EMPTY;
        }
    }

    /**
     * Reverses a completed move.
     * @param {CompletedMove} completedMove The completed move.
     */
    executeMoveReverse(completedMove) {
        if (completedMove.promoted) {
            this.board[completedMove.from[1]][completedMove.from[0]] = this.getPlayerRegular(completedMove.by);
        } else {
            this.board[completedMove.from[1]][completedMove.from[0]] = this.board[completedMove.to[1]][completedMove.to[0]];
        }

        this.board[completedMove.to[1]][completedMove.to[0]] = TileState.EMPTY;

        if (completedMove.captured) {
            this.board[completedMove.captured[1]][completedMove.captured[0]] = completedMove.captured[2];
        }
    }

    /**
     * Makes a move.
     * @param {Move} move The move.
     * @returns {CompletedMove} The completed move.
     */
    move(move) {
        const playerId = this.getPlayerId(...move.from);
        const isQueen = this.isQueen(...move.from);
        const promoted = move.to[1] === this.getPromotionRow(playerId) && !isQueen;
        const captured = this.getCapturedPiece(move);
        const multicapture = this.previousMoves.length > 0 && this.previousMoves[this.previousMoves.length - 1].by === playerId;
        
        let consecutiveQueenMoves = 0; 
        if (isQueen && !captured) {
            consecutiveQueenMoves = this.previousMoves[this.previousMoves.length - 1].consecutiveQueenMoves + 1;
        }

        const completedMove = new CompletedMove(move.from, move.to, playerId, captured, promoted, multicapture, consecutiveQueenMoves);

        this.previousMoves.push(completedMove);
        this.nextMoves = [];
        this.executeMove(completedMove);
        return completedMove;
    }

    /**
     * Undoes the last move.
     * @returns {CompletedMove} The undone move.
     */
    undo() {
        const move = this.previousMoves.pop();
        if (!move) {
            return;
        }

        this.nextMoves.push(move);
        this.executeMoveReverse(move);
        return move;
    }

    /**
     * Prepares the game for film mode.
     * @returns {Array} The game moves up to this point.
     */
    prepareFilm() {
        const moves = this.previousMoves;
        this.player1.score = 0;
        this.player2.score = 0;

        return moves;
    }

    /**
     * Redoes the last undone move.
     * @returns {CompletedMove} The redone move.
     */
    redo() { // TODO: delete this and associated code? like this.nextMoves...
        const move = this.nextMoves.pop();
        if (!move) {
            return;
        }

        this.previousMoves.push(move);
        this.executeMove(move);
        return move;
    }

    /**
     * Sets the game state.
     * @param {GameState} game_state The game state.
     */
    setGameState(game_state) {
        this.state = game_state;
    }

    /**
     * Gets the game state.
     * @returns {GameState} The game state.
     */
    getGameState() {
        return this.state;
    }

    /**
     * Gets the player with the given ID.
     * @param {Number} playerId The player ID.
     * @returns {Player} The player.
     */
    getPlayer(playerId) {
        return playerId === 1 ? this.player1 : this.player2;
    }

    /**
     * Gets the opponent of the given player.
     * @param {Player} player The player.
     * @returns {Player} The opponent.
     */
    getOpponent(player) {
        return player.getId() === 1 ? this.player2 : this.player1;
    }

    /**
     * Gets the opponent's ID.
     * @param {Number} playerId The player ID.
     * @returns {Number} The opponent's ID.
     */
    getOpponentId(playerId) {
        if (playerId == 1) {
            return 2;
        } else if (playerId == 2) {
            return 1;
        } else {
            return 0;
        }
    }

    /**
     * Updates the game.
     * @param {Number} t The current time.
     */
    update(t) {
        if (this.state.increaseGameTime()) {
            this.gameTime += (t - this.current_time) / 1000;
        }
        this.current_time = t;
        this.state.update(t);
    }

    /**
     * Initializes the board with the starting positions.
     */
    initBoard() {
        this.board = [];
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.BOARD_SIZE; j++) {
                if (i % 2 != j % 2) {
                    this.board[i][j] = TileState.WHITE;
                } else if (i < 3) {
                    this.board[i][j] = TileState.PLAYER_1;
                } else if (i > 4) {
                    this.board[i][j] = TileState.PLAYER_2;
                } else {
                    this.board[i][j] = TileState.EMPTY;
                }
            }
        }     
    }

    /**
     * Gets the captured piece in a move.
     * @param {Move} move The move.
     * @returns {Array} The captured piece's x coordinate, y coordinate and tile state.
     */
    getCapturedPiece(move) {
        if (Math.abs(move.to[0] - move.from[0]) == 1) {
            return; // Can't capture if only moving one tile
        }

        const dx = move.to[0] - move.from[0];
        const dy = move.to[1] - move.from[1];
        const capturedX = move.to[0] - dx / Math.abs(dx);
        const capturedY = move.to[1] - dy / Math.abs(dy);
        if (this.board[capturedY][capturedX] === TileState.EMPTY) {
            return null;
        }

        return [capturedX, capturedY, this.board[capturedY][capturedX]];
    }

    /**
     * Gets the score of the player with the given ID.
     * @param {Number} playerId The player ID.
     * @returns {Number} The score.
     */
    getScore(playerId) {
        if (playerId == 1) {
            return this.player1.getScore();
        } else if (playerId == 2) {
            return this.player2.getScore();
        } else {
            return 0;
        }
    }

    /**
     * Checks if there is a queen in the given position.
     * @param {Number} x The x coordinate.
     * @param {Number} y The y coordinate.
     * @returns {Boolean} True if there is a queen, false otherwise.
     */
    isQueen(x, y) {
        return this.board[y][x] == TileState.PLAYER_1_QUEEN || this.board[y][x] == TileState.PLAYER_2_QUEEN;
    }

    /**
     * Checks if there is a regular piece in the given position.
     * @param {Number} x The x coordinate.
     * @param {Number} y The y coordinate.
     * @returns {Boolean} True if there is a regular piece, false otherwise.
     */
    isRegular(x, y) {
        return this.board[y][x] == TileState.PLAYER_1 || this.board[y][x] == TileState.PLAYER_2;
    }

    /**
     * Gets the player ID of the piece in the given position.
     * @param {Number} x The x coordinate.
     * @param {Number} y The y coordinate.
     * @returns {Number} The player ID.
     */
    getPlayerId(x, y) {
        const tileState = this.board[y][x];
        if (tileState == TileState.PLAYER_1 || tileState == TileState.PLAYER_1_QUEEN) {
            return 1;
        } else if (tileState == TileState.PLAYER_2 || tileState == TileState.PLAYER_2_QUEEN) {
            return 2;
        } else {
            return 0;
        }
    }

    /**
     * Gets Queen tile state of the player with the given ID.
     * @param {Number} playerId The player ID.
     * @returns {TileState} The Queen tile state.
     */
    getPlayerQueen(playerId) {
        if (playerId == 1) {
            return TileState.PLAYER_1_QUEEN;
        } else if (playerId == 2) {
            return TileState.PLAYER_2_QUEEN;
        }
    }

    /**
     * Gets regular tile state of the player with the given ID.
     * @param {Number} playerId The player ID.
     * @returns {TileState} The regular tile state.
     */
    getPlayerRegular(playerId) {
        if (playerId == 1) {
            return TileState.PLAYER_1;
        } else if (playerId == 2) {
            return TileState.PLAYER_2;
        }
    }

    /**
     * Gets the promotion row of the player with the given ID.
     * @param {Number} playerId The player ID.
     * @returns {Number} The promotion row.
     */
    getPromotionRow(playerId) {
        if (playerId == 1) {
            return this.BOARD_SIZE - 1;
        } else if (playerId == 2) {
            return 0;
        }
    }

    /**
     * Checks if the given position is inside the board.
     * @param {Number} x The x coordinate.
     * @param {Number} y The y coordinate.
     * @returns {Boolean} True if the position is inside the board, false otherwise.
     */
    insideBoard(x, y) {
        return x >= 0 && x < this.BOARD_SIZE && y >= 0 && y < this.BOARD_SIZE;
    }

    /**
     * Gets the positions of the checkers pieces of the player with the given ID.
     * @param {Number} playerId The player ID.
     * @returns {Array} The positions of the pieces.
     */
    getPieces(playerId) {
        const pieces = [];
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            for (let j = 0; j < this.BOARD_SIZE; j++) {
                if (this.getPlayerId(j, i) == playerId) {
                    pieces.push([j, i]);
                }
            }
        }
        return pieces;
    }

    /**
     * Gets the valid moves for the player with the given ID.
     * If there are capture moves, only capture moves are returned.
     * @param {Number} playerId The player ID.
     * @returns {Array} The valid moves.
     */
    getValidMoves(playerId) {
        const captureMoves = [];
        const nonCaptureMoves = [];

        const pieces = this.getPieces(playerId);
        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i];
            const moves = this.getValidMovesFor(piece[0], piece[1]);
            captureMoves.push(...moves[0]);
            nonCaptureMoves.push(...moves[1]);
        }

        return captureMoves.length > 0 ? captureMoves : nonCaptureMoves;
    }

    /**
     * Gets the valid moves for the piece in the given position.
     * @param {Number} x The x coordinate.
     * @param {Number} y The y coordinate.
     * @returns {Array} The valid moves.
     * 
     * The first element of the array is an array of capture moves.
     * The second element of the array is an array of non-capture moves.
     */
    getValidMovesFor(x, y) {
        const currentPlayerId = this.getPlayerId(x, y);
        const isQueen = this.isQueen(x, y);

        let directions = [];
        if (isQueen) {
            directions.push(...P1_FORWARD_DIRECTIONS);
            directions.push(...P2_FORWARD_DIRECTIONS);
        } else if (currentPlayerId == 1) {
            directions.push(...P1_FORWARD_DIRECTIONS);
        } else if (currentPlayerId == 2) {
            directions.push(...P2_FORWARD_DIRECTIONS);
        }

        const nonCaptureMoves = [];
        const captureMoves = [];

        for (let i = 0; i < directions.length; i++) {
            const direction = directions[i];
            let currentX = x;
            let currentY = y;
            while (true) {
                currentX += direction[0];
                currentY += direction[1];

                if (!this.insideBoard(currentX, currentY)) {
                    break;
                }

                const currentTile = this.board[currentY][currentX];
                if (currentTile === TileState.EMPTY) {
                    nonCaptureMoves.push(new Move([x, y], [currentX, currentY]));
                    if (isQueen) {
                        continue;
                    }

                    break;
                }

                if (this.getPlayerId(currentX, currentY) !== currentPlayerId) {
                    currentX += direction[0];
                    currentY += direction[1];

                    if (this.insideBoard(currentX, currentY)) {
                        if (this.board[currentY][currentX] === TileState.EMPTY) {
                            captureMoves.push(new Move([x, y], [currentX, currentY]));
                        }
                    }
                }

                break;
            }
        }

        return [captureMoves, nonCaptureMoves];
    }
}
