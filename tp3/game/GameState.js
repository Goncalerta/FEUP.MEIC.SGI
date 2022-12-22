class GameState {
    constructor(model) {
        this.model = model;
    }

    update(t) {}

    selectPiece(x, y) {}
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
        console.log("Selected piece at " + x + ", " + y);

        this.model.setGameState(new PieceSelectedState(this.model, this.player, this.start_time, this.current_time, this.model.board[x][y]));
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
