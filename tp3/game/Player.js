export class Player {
    constructor(id, name, score=0, cumulativeTime=0) {
        this.id = id;
        this.name = name;
        this.score = score;
        this.cumulativeTime = cumulativeTime;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getScore() {
        return this.score;
    }

    changeScore(delta) {
        this.score += delta;
    }

    getCumulativeTime() {
        return this.cumulativeTime;
    }

    changeCumulativeTime(delta) {
        this.cumulativeTime += delta;
    }
}
