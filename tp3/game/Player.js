import { GameModel } from "./GameModel.js";

export class Player {
    static PLAYER_LENGTH = 5;
    static PLAYER_1_DEFAULT_NAME = "BLACK";
    static PLAYER_2_DEFAULT_NAME = "RED";

    constructor(id, name, score=0, cumulativeTime=0) {
        this.id = id;
        this.name = name.padEnd(Player.PLAYER_LENGTH, ' ');
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
        const timeLeft = GameModel.GAME_TIME_LIMIT_PER_PLAYER - this.getCumulativeTime();
        return timeLeft > 0 ? timeLeft : 0;
    }
}
