const TileState = {
    WHITE: -1,
    EMPTY: 0,
    PLAYER_1: 1,
    PLAYER_2: 2,
    PLAYER_1_QUEEN: 3,
    PLAYER_2_QUEEN: 4,
};

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

    // This function assumes some basic things about the move (for example, that the move is within the board and the current player is playing)
    // This is because those checks probably make sense to be made elsewhere, in the picking detection, for example
    isMoveValid(move) {
        const x = move.from[0];
        const y = move.from[1];
        const targetX = move.to[0];
        const targetY = move.to[1];
        const deltaX = Math.abs(targetX - x);
        const deltaY = Math.abs(targetY - y);

        if (this.board[targetY][targetX] != TileState.EMPTY) {
            return false;
        }

        if (deltaX != deltaY) {
            return false;
        }

        const delta = deltaX; // for semantic purposes
        if (delta == 0) {
            return false;
        }

        const currentPlayer = this.getPlayer(x, y);
        const deltaOneX = (targetX - x) / deltaX;
        const deltaOneY = (targetY - y) / deltaY;

        if (isQueen(x, y)) {
            let currentX = x + deltaOneX;
            let currentY = y + deltaOneY;
            let opponentPiecesInPath = 0;
            while (currentX != targetKillX) {
                const currentTile = this.getPlayer(currentX, currentY);

                if (currentTile == this.getOpponent(currentPlayer)) {
                    // We can't jump over more than one opponent piece
                    opponentPiecesInPath++;
                } else if (currentTile == currentPlayer) {
                    // We can't jump over our own pieces
                    return false;
                }

                currentX += deltaOneX;
                currentY += deltaOneY;
            }

            return opponentPiecesInPath == 0 || opponentPiecesInPath == 1;
        } else {
            if (delta == 1) {
                return true;
            }

            if (delta != 2) {
                return false;
            }

            const targetKillX = x + deltaOneX;
            const targetKillY = y + deltaOneY;

            const targetKill = this.getPlayer(targetKillX, targetKillY)
            
            return targetKill != 0 && targetKill != currentPlayer;
        }
    }
}
