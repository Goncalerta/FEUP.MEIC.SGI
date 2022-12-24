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

    selectPiece(piece, x, y) {}

    selectTile(x, y) {}

    getCurrentPlayer() {
        return null;
    }
}

export class PlayerTurnState extends GameState {
    static TURN_TIME_LIMIT = 300;

    constructor(model, player, startTime, t = null, validMoves = null) {
        super(model);
        this.player = player;
        this.start_time = startTime;
        this.current_time = t !== null? t : startTime;
        this.validMoves = validMoves? validMoves : this.model.getValidMoves(this.player.getId());
    }

    selectPiece(piece, x, y) {
        if (this.model.getPlayerId(x, y) !== this.player.getId()) {
            return;
        }

        const filteredValidMoves = this.validMoves.filter(move => move.from[0] == x && move.from[1] == y);

        this.model.setGameState(new PieceSelectedState(this.model, this.player, this.start_time, this.current_time, this.validMoves, filteredValidMoves, piece, [x, y]));
    }

    update(t) {
        this.current_time = t;
        // TODO check if time is up
    }

    getCurrentPlayer() {
        return this.player;
    }

    getRemainingTime() {
        const t = PlayerTurnState.TURN_TIME_LIMIT - Math.round((this.current_time - this.start_time) / 1000);
        return t > 0 ? t : 0;
    }
}

export class PieceSelectedState extends PlayerTurnState {
    constructor(model, player, startTime, t, validMoves, filteredValidMoves, piece, piecePosition) {
        super(model, player, startTime, t, validMoves);
        this.piece = piece;
        this.piecePosition = piecePosition;
        this.filteredValidMoves = filteredValidMoves;
    }

    selectPiece(piece, x, y) {
        if (x == this.piecePosition[0] && y == this.piecePosition[1]) {
            this.model.setGameState(new PlayerTurnState(this.model, this.player, this.start_time, this.current_time, this.validMoves));
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
            this.model.setGameState(new PieceMovingState(this.model, this.player, this.start_time, this.current_time, completedMove, this.piece));
        } else {
            this.model.game.makeCross(x, y);
            this.model.setGameState(new PlayerTurnState(this.model, this.player, this.start_time, this.current_time));
        }
    }

    getSelectedPiece() {
        return this.piece;
    }

    getMoveHints() {
        return this.filteredValidMoves.map(move => move.to);
    }

    getCurrentPlayer() {
        return this.player;
    }
}

export class PieceMovingState extends GameState {
    constructor(model, player, startTime, moveTime, completedMove, piece) {
        super(model);
        this.player = player;
        this.start_time = startTime;
        this.move_time = moveTime;
        this.completedMove = completedMove;
        this.piece = piece;

        this.piece.animateMove(completedMove);
    }
}

export class GameOverState extends GameState {
    constructor(model, winner) {
        super(model);
        this.winner = winner;
    }
}
