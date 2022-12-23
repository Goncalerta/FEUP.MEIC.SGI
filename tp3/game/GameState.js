class GameState {
    constructor(model) {
        this.model = model;
    }

    update(t) {}

    getSelectedPiece() {
        return null;
    }

    selectPiece(x, y) {}

    selectTile(x, y) {}
}

export class PlayerTurnState extends GameState {
    TURN_TIME_LIMIT = 300;

    constructor(model, player, start_time, t = null) {
        super(model);
        this.player = player;
        this.start_time = start_time;
        this.current_time = t !== null? t : start_time;
    }

    selectPiece(x, y) {
        if (this.model.getPlayer(x, y) !== this.player) {
            return;
        }

        // TODO get valid moves        

        this.model.setGameState(new PieceSelectedState(this.model, this.player, this.start_time, this.current_time, [x, y]));
    }

    update(t) {
        this.current_time = t;
        // TODO check if time is up
    }
}

export class PieceSelectedState extends PlayerTurnState {
    constructor(model, player, start_time, t, piece) {
        super(model, player, start_time, t);
        this.piece = piece;
    }

    selectPiece(x, y) {
        if (x == this.piece[0] && y == this.piece[1]) {
            this.model.setGameState(new PlayerTurnState(this.model, this.player, this.start_time, this.current_time));
            return;
        }

        if (this.model.getPlayer(x, y) === this.player) {
            super.selectPiece(x, y);
        } else {
            console.log("selecting tile")
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
