import { CGFtexture } from "../../lib/CGF.js";
import { MyCircle } from "../MyCircle.js";
import { MyCylinder } from "../MyCylinder.js";
import { arraysEqual } from "../utils.js";
import { MyChecker } from "./MyChecker.js";

/**
 * MyCheckerGroup class, representing the game checkers.
 */
export class MyCheckerGroup {
    MATERIAL_P1 = {
        shininess: 5,
        emission: [0.1, 0.1, 0.1, 1.0],
        ambient: [0.1, 0.1, 0.1, 1.0],
        diffuse: [0.15, 0.15, 0.15, 1.0],
        specular: [0.96, 0.95, 0.95, 1.0],
    };

    MATERIAL_P2 = {
        shininess: 5,
        emission: [0.3, 0.01, 0.005, 1.0],
        ambient: [0.3, 0.01, 0.005, 1.0],
        diffuse: [0.9, 0.3, 0.29, 1.0],
        specular: [0.96, 0.96, 0.96, 1.0],
    };

    MATERIAL_HIGHLIGHTED_P1 = {
        shininess: 5,
        emission: [0.25, 0.25, 0.25, 1.0],
        ambient: [0.01, 0.01, 0.01, 1.0],
        diffuse: [0.15, 0.15, 0.15, 1.0],
        specular: [0.96, 0.95, 0.95, 1.0],
    };

    MATERIAL_HIGHLIGHTED_P2 = {
        shininess: 5,
        emission: [0.5, 0.21, 0.205, 1.0],
        ambient: [0.3, 0.01, 0.005, 1.0],
        diffuse: [0.9, 0.3, 0.29, 1.0],
        specular: [0.96, 0.96, 0.96, 1.0],
    };

    MATERIAL_SELECTED = {
        shininess: 5,
        emission: [0.2, 0.3, 0.005, 1.0],
        ambient: [0.2, 0.3, 0.005, 1.0],
        diffuse: [0.3, 1.0, 0.1, 1.0],
        specular: [0.8, 1.0, 0.8, 1.0],
    };

    MATERIAL_UNALLOWED = {
        shininess: 5,
        emission: [1, 0, 0, 1.0],
        ambient: [1, 0, 0, 1.0],
        diffuse: [0, 0, 0, 1.0],
        specular: [0, 0, 0, 1.0],
    };

    PIECE_HEIGHT = 0.1;
    PIECE_TILE_RATIO = 0.4;

    UNPROMOTED_BASE_TEXTURE = "scenes/images/game/checker_base.png";
    PROMOTED_BASE_TEXTURE = "scenes/images/game/checker_base_crown.png";

    /**
     * @constructor
     * @param scene Reference to MyScene object.
     * @param model Reference to MyGameModel object.
     * @param player1 Reference to MyPlayer object.
     * @param player2 Reference to MyPlayer object.
     * @param tileSize Size of a tile.
     */
    constructor(scene, model, player1, player2, tileSize) {
        const radius = tileSize * this.PIECE_TILE_RATIO;
        const height = this.PIECE_HEIGHT;
        this.scene = scene;
        this.model = model;

        this.textures = {
            "unpromoted_base": new CGFtexture(scene, this.UNPROMOTED_BASE_TEXTURE),
            "promoted_base": new CGFtexture(scene, this.PROMOTED_BASE_TEXTURE),
            "side": null,
        }

        this.materialsP1 = {
            "normal": this.MATERIAL_P1,
            "highlighted": this.MATERIAL_HIGHLIGHTED_P1,
            "selected": this.MATERIAL_SELECTED,
            "unallowed": this.MATERIAL_UNALLOWED,
        };

        this.materialsP2 = {
            "normal": this.MATERIAL_P2,
            "highlighted": this.MATERIAL_HIGHLIGHTED_P2,
            "selected": this.MATERIAL_SELECTED,
            "unallowed": this.MATERIAL_UNALLOWED,
        };

        this.geometries = {
            "major_cylinder": new MyCylinder(scene, radius, radius, height, 50, 10),
            "minor_cylinder": new MyCylinder(scene, radius*0.8, radius*0.8, height, 50, 10),
            "major_circle": new MyCircle(scene, radius, [0, 0, 0], 50),
            "minor_circle": new MyCircle(scene, radius*0.8, [0, 0, 0], 50),
        }

        const p1_pieces = this.model.getPieces(1);
        const p2_pieces = this.model.getPieces(2);

        this.pieces = [];

        for (let i = 0; i < p1_pieces.length; i++) {
            const piece = p1_pieces[i];
            this.pieces.push(new MyChecker(scene, this.geometries, this.materialsP1, this.textures, this.model, 100 + i, tileSize, radius, height, player1, piece));
        }

        for (let i = 0; i < p2_pieces.length; i++) {
            const piece = p2_pieces[i];
            this.pieces.push(new MyChecker(scene, this.geometries, this.materialsP2, this.textures, this.model, 200 + i, tileSize, radius, height, player2, piece));
        }
    }

    /**
     * Gets the checker at the given tile.
     * @param {number} x X coordinate of the tile.
     * @param {number} y Y coordinate of the tile.
     * @returns {MyChecker} Checker at the given tile.
     */
    getChecker(x, y) {
        return this.pieces.find((piece) => arraysEqual(piece.boardPosition, [x, y]));
    }

    /**
     * Displays all checkers.
     */
    display() {
        for (let i = 0; i < this.pieces.length; i++) {
            this.pieces[i].display();
        }
    }
}
