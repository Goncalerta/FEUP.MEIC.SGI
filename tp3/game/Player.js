import { GameModel } from "./GameModel.js";

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
        return Math.round(this.cumulativeTime);
    }

    changeCumulativeTime(delta) {
        this.cumulativeTime += delta;
    }

    getGameTimeLeft() {
        return GameModel.GAME_TIME_LIMIT_PER_PLAYER - this.getCumulativeTime();
    }
}
