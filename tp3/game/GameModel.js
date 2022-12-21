import { Move } from "./Move";

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
    
    constructor() {
        this.initBoard();
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

    getOpponent(player) {
        if (player == 1) {
            return 2;
        } else if (player == 2) {
            return 1;
        } else {
            return 0;
        }
    }

    isQueen(x, y) {
        return this.board[y][x] == TileState.PLAYER_1_QUEEN || this.board[y][x] == TileState.PLAYER_2_QUEEN;
    }

    getPlayer(x, y) {
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

    getPieces(player) {
        pieces = [];
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            for (let j = 0; j < this.BOARD_SIZE; j++) {
                if (this.getPlayer(j, i) == player) {
                    pieces.push([j, i]);
                }
            }
        }
        return pieces;
    }

    getValidMoves(player) {
        const captureMoves = [];
        const nonCaptureMoves = [];

        const pieces = this.getPieces(player);
        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i];
            const moves = this.getValidMovesFor(piece[0], piece[1]);
            captureMoves.push(...moves[0]);
            nonCaptureMoves.push(...moves[1]);
        }

        return captureMoves.length > 0 ? captureMoves : nonCaptureMoves;
    }

    getValidMovesFor(x, y) {
        const currentPlayer = this.getPlayer(x, y);
        const isQueen = this.isQueen(x, y);

        let directions = [];
        if (isQueen) {
            directions.push(P1_FORWARD_DIRECTIONS);
            directions.push(P2_FORWARD_DIRECTIONS);
        } else if (currentPlayer == 1) {
            directions.push(P1_FORWARD_DIRECTIONS);
        } else if (currentPlayer == 2) {
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

                if (this.getPlayer(currentX, currentY) !== currentPlayer) {
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

    // This function assumes some basic things about the move (for example, that the move is within the board and the current player is playing)
    // This is because those checks probably make sense to be made elsewhere, in the picking detection, for example
    // This function was a bad idea: first we usually need all valid moves (to highlight in the screen), not only whether a move is valid or not
    // Second, we have currently no easy way of determining whether there are possible captures or not, which determines whether other moves are valid or not
    // isMoveValid(move) {
    //     const x = move.from[0];
    //     const y = move.from[1];
    //     const targetX = move.to[0];
    //     const targetY = move.to[1];
    //     const deltaX = Math.abs(targetX - x);
    //     const deltaY = Math.abs(targetY - y);

    //     if (this.board[targetY][targetX] != TileState.EMPTY) {
    //         return false;
    //     }

    //     if (deltaX != deltaY) {
    //         return false;
    //     }

    //     // for semantic purposes
    //     const delta = deltaX;

    //     if (isQueen(x, y)) {
    //         const currentPlayer = this.getPlayer(x, y);
    //         const deltaOneX = (targetX - x) / deltaX;
    //         const deltaOneY = (targetY - y) / deltaY;

    //         let currentX = x + deltaOneX;
    //         let currentY = y + deltaOneY;
    //         let opponentPiecesInPath = 0;
    //         while (currentX != targetKillX) {
    //             const currentTile = this.getPlayer(currentX, currentY);

    //             if (currentTile == this.getOpponent(currentPlayer)) {
    //                 // We can't jump over more than one opponent piece
    //                 opponentPiecesInPath++;
    //             } else if (currentTile == currentPlayer) {
    //                 // We can't jump over our own pieces
    //                 return false;
    //             }

    //             currentX += deltaOneX;
    //             currentY += deltaOneY;
    //         }

    //         return opponentPiecesInPath == 0 || opponentPiecesInPath == 1;
    //     } else {
    //         if (delta == 1) {
    //             return true;
    //         }

    //         if (delta != 2) {
    //             return false;
    //         }

    //         const currentPlayer = this.getPlayer(x, y);
    //         const deltaOneX = (targetX - x) / deltaX;
    //         const deltaOneY = (targetY - y) / deltaY;

    //         const targetKillX = x + deltaOneX;
    //         const targetKillY = y + deltaOneY;

    //         const targetKill = this.getPlayer(targetKillX, targetKillY);

    //         return targetKill != 0 && targetKill != currentPlayer;
    //     }
    // }
}
