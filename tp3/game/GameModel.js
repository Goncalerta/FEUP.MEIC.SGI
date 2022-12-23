import { PlayerTurnState } from "./GameState.js";
import { Move } from "./Move.js";

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
    // TODO adjust value
    static GAME_TIME_LIMIT_PER_PLAYER = 3000;
    
    constructor(start_time, player1, player2) {
        this.initBoard();

        this.player1 = player1;
        this.player2 = player2;

        this.state = new PlayerTurnState(this, this.player1, start_time);

        this.start_time = start_time;
        this.current_time = start_time;
        this.previousMoves = [];
        this.nextMoves = [];
    }

    executeMove(move) {
        // TODO
    }

    executeMoveReverse(move) {
        // TODO
    }

    move(move) {
        this.previousMoves.push(move);
        this.nextMoves = [];
        this.executeMove(move);
    }

    undo() {
        const move = this.previousMoves.pop();
        if (!move) {
            return;
        }

        this.nextMoves.push(move);
        this.executeMoveReverse(move);
    }

    redo() {
        const move = this.nextMoves.pop();
        if (!move) {
            return;
        }

        this.previousMoves.push(move);
        this.executeMove(move);
    }

    setGameState(game_state) {
        this.state = game_state;
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
            directions.push(P1_FORWARD_DIRECTIONS);
            directions.push(P2_FORWARD_DIRECTIONS);
        } else if (currentPlayerId == 1) {
            directions.push(P1_FORWARD_DIRECTIONS);
        } else if (currentPlayerId == 2) {
            directions.push(P2_FORWARD_DIRECTIONS);
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
