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
        const targetx = move.to[0];
        const targety = move.to[1];
        const deltax = Math.abs(targetx - x);
        const deltay = Math.abs(targety - y);

        if (this.board[targety][targetx] != TileState.EMPTY) {
            return false;
        }

        if (deltax != deltay) {
            return false;
        }

        

        if (isQueen(x, y)) {
            // TODO
        } else {
            // TODO
            if (deltax == 1) {
                return true;
            }

            if (deltax != 2) {
                return false;
            }

            const currentPlayer = this.getPlayer(x, y);
            const deltaOne = (targetx - x) / deltax;
            const targetKillX = targetx - deltaOne;
            const targetKillY = targety - deltaOne;

            // This commented logic is for the queen lol
            // let currentX = x + deltaOne;
            // let currentY = y + deltaOne;
            // while (currentX != targetKillX) {
            //     if (this.board[currentX][currentY] != TileState.EMPTY) {
            //         return false;
            //     }

            //     currentX += deltaOne;
            //     currentY += deltaOne;
            // }

            const targetKill = this.getPlayer(targetKillX, targetKillY)
            if (targetKill != 0 && targetKill != this.getPlayer(x, y)) {
                return true;
            }

            return false;
        }
    }
}
