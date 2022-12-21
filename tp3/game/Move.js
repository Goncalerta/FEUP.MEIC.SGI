export class Move {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
}

export class CompletedMove extends Move {
    constructor(from, to, captured, promoted) {
        super(from, to);
        this.captured = captured;
        this.promoted = promoted;
    }
}
