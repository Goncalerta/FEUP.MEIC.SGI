export class Move {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
}

export class CompletedMove extends Move {
    constructor(from, to, by, captured = null, promoted = false, multicapture = false) {
        super(from, to);
        this.by = by;
        this.captured = captured;
        this.promoted = promoted;
        this.multicapture = multicapture;
    }

    nextPlayerId() {
        if (this.captured) {
            return this.by;
        }

        return this.by === 1? 2 : 1;
    }
}
