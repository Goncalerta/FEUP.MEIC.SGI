class GameState {
    constructor(setState) {
        this.setState = setState;
    }

    update(t) {}
}

export class PlayerTurnState extends GameState {
    TURN_TIME_LIMIT = 300;

    constructor(setState, player, start_time) {
        super(setState);
        this.player = player;
        this.start_time = start_time;
        this.elapsed_time = 0;
    }

    update(t) {
        this.elapsed_time = t;
        // TODO check if time is up
    }
}

export class PieceMovingState extends GameState {
    constructor(setState) {
        super(setState);

    }
}

export class GameOverState extends GameState {
    constructor(setState, winner) {
        super(setState);
        this.winner = winner;
    }
}
