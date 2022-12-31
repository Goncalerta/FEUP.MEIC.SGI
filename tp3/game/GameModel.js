import { PlayerTurnState } from "./GameState.js";
import { CompletedMove, Move } from "./Move.js";

const TileState = {
    WHITE: -1,
    EMPTY: 0,
    PLAYER_1: 1,
    PLAYER_2: 2,
    PLAYER_1_QUEEN: 3,
    PLAYER_2_QUEEN: 4,
};

const P1_FORWARD_DIRECTIONS = [[1, 1], [-1, 1]];
const P2_FORWARD_DIRECTIONS = [[1, -1], [-1, -1]];

export class GameModel {
    BOARD_SIZE = 8;
    
    constructor(game, start_time, player1, player2) {
        this.game = game;
        this.initBoard();

        this.player1 = player1;
        this.player2 = player2;

        this.state = new PlayerTurnState(this, this.player1, start_time);

        this.start_time = start_time;
        this.current_time = start_time;
        this.previousMoves = [];
        this.nextMoves = [];
    }

    getGameTime() {
        return Math.floor((this.state.getGameTime() - this.start_time) / 1000);
    }

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

    move(move) {
        const playerId = this.getPlayerId(...move.from);
        const promoted = move.to[1] === this.getPromotionRow(playerId) && !this.isQueen(...move.from);
        const captured = this.getCapturedPiece(move);
        const multicapture = this.previousMoves.length > 0 && this.previousMoves[this.previousMoves.length - 1].by === playerId;

        const completedMove = new CompletedMove(move.from, move.to, playerId, captured, promoted, multicapture);

        this.previousMoves.push(completedMove);
        this.nextMoves = [];
        this.executeMove(completedMove);
        return completedMove;
    }

    undo() {
        const move = this.previousMoves.pop();
        if (!move) {
            return;
        }

        this.nextMoves.push(move);
        this.executeMoveReverse(move);
        return move;
    }

    undoAll() {
        const moves = this.previousMoves;
        this.previousMoves = [];
        this.initBoard();

        this.player1.score = 0;
        this.player2.score = 0;

        return moves;
    }

    redo() {
        const move = this.nextMoves.pop();
        if (!move) {
            return;
        }

        this.previousMoves.push(move);
        this.executeMove(move);
        return move;
    }

    setGameState(game_state) {
        this.state = game_state;
    }

    getGameState() {
        return this.state;
    }

    getPlayer(playerId) {
        return playerId === 1 ? this.player1 : this.player2;
    }

    getOpponent(player) {
        return player.getId() === 1 ? this.player2 : this.player1;
    }

    update(t) {
        this.current_time = t;
        this.state.update(t);
    }

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

        // TODO remove: this helps to debug
        //this.board = [
        //    [0, -1, 0, -1, 0, -1, 0, -1],
        //    [-1, 0, -1, 0, -1, 0, -1, 0],
        //    [0, -1, 0, -1, 0, -1, 0, -1],
        //    [-1, 0, -1, 0, -1, 1, -1, 0],
        //    [0, -1, 0, -1, 2, -1, 0, -1],
        //    [-1, 0, -1, 0, -1, 0, -1, 0],
        //    [0, -1, 2, -1, 0, -1, 0, -1],
        //    [-1, 0, -1, 0, -1, 0, -1, 0],
        //];        
    }

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

    getOpponentId(playerId) {
        if (playerId == 1) {
            return 2;
        } else if (playerId == 2) {
            return 1;
        } else {
            return 0;
        }
    }

    getScore(playerId) {
        if (playerId == 1) {
            return this.player1.getScore();
        } else if (playerId == 2) {
            return this.player2.getScore();
        } else {
            return 0;
        }
    }

    isQueen(x, y) {
        return this.board[y][x] == TileState.PLAYER_1_QUEEN || this.board[y][x] == TileState.PLAYER_2_QUEEN;
    }

    isRegular(x, y) {
        return this.board[y][x] == TileState.PLAYER_1 || this.board[y][x] == TileState.PLAYER_2;
    }

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

    getPlayerQueen(playerId) {
        if (playerId == 1) {
            return TileState.PLAYER_1_QUEEN;
        } else if (playerId == 2) {
            return TileState.PLAYER_2_QUEEN;
        }
    }

    getPlayerRegular(playerId) {
        if (playerId == 1) {
            return TileState.PLAYER_1;
        } else if (playerId == 2) {
            return TileState.PLAYER_2;
        }
    }

    getPromotionRow(playerId) {
        if (playerId == 1) {
            return this.BOARD_SIZE - 1;
        } else if (playerId == 2) {
            return 0;
        }
    }

    insideBoard(x, y) {
        return x >= 0 && x < this.BOARD_SIZE && y >= 0 && y < this.BOARD_SIZE;
    }

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
