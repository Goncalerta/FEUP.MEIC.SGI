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

    selectPiece(x, y) {}

    selectTile(x, y) {}
}

export class PlayerTurnState extends GameState {
    TURN_TIME_LIMIT = 300;

    constructor(model, player, start_time, t = null, validMoves = null) {
        super(model);
        this.player = player;
        this.start_time = start_time;
        this.current_time = t !== null? t : start_time;
        this.validMoves = validMoves? validMoves : this.model.getValidMoves(this.player.getId());
    }

    selectPiece(x, y) {
        if (this.model.getPlayerId(x, y) !== this.player.getId()) {
            return;
        }

        const filteredValidMoves = this.validMoves.filter(move => move.from[0] == x && move.from[1] == y);

        this.model.setGameState(new PieceSelectedState(this.model, this.player, this.start_time, this.current_time, this.validMoves, filteredValidMoves, [x, y]));
    }

    update(t) {
        this.current_time = t;
        // TODO check if time is up
    }
}

export class PieceSelectedState extends PlayerTurnState {
    constructor(model, player, start_time, t, validMoves, filteredValidMoves, piece) {
        super(model, player, start_time, t, validMoves);
        this.piece = piece;
        this.filteredValidMoves = filteredValidMoves;
    }

    selectPiece(x, y) {
        if (x == this.piece[0] && y == this.piece[1]) {
            this.model.setGameState(new PlayerTurnState(this.model, this.player, this.start_time, this.current_time, this.validMoves));
            return;
        }

        if (this.model.getPlayerId(x, y) === this.player.getId()) {
            super.selectPiece(x, y);
        } else {
            this.selectTile(x, y);
        }
    }

    selectTile(x, y) {
        this.model.game.makeCross(x, y);
        this.model.setGameState(new PlayerTurnState(this.model, this.player, this.start_time, this.current_time));
        return;
    }

    getSelectedPiece() {
        return this.piece;
    }

    getMoveHints() {
        return this.filteredValidMoves.map(move => move.to);
    }
}

export class PieceMovingState extends GameState {
    constructor(model) {
        super(model);

    }
}

export class GameOverState extends GameState {
    constructor(model, winner) {
        super(model);
        this.winner = winner;
    }
}
