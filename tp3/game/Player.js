/**
 * Player class, representing a game player.
 */
export class Player {
    static PLAYER_LENGTH = 5;
    static PLAYER_1_DEFAULT_NAME = "BLACK";
    static PLAYER_2_DEFAULT_NAME = "RED";

    /**
     * @constructor
     * @param {number} id - Player id
     * @param {string} name - Player name
     * @param {number} score - Player score
     */
    constructor(id, name, score=0) {
        this.id = id;
        this.name = name.padEnd(Player.PLAYER_LENGTH, ' ');
        this.score = score;
    }

    /**
     * Gets the player id.
     * @returns {number} - Player id
     */
    getId() {
        return this.id;
    }

    /**
     * Gets the player name.
     * @returns {string} - Player name
     */
    getName() {
        return this.name;
    }

    /**
     * Gets the player score.
     * @returns {number} - Player score
     */
    getScore() {
        return this.score;
    }

    /**
     * Changes the player score.
     * @param {number} delta - The score change
     */
    changeScore(delta) {
        this.score += delta;
    }
}
