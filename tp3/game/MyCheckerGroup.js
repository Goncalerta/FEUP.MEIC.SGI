import { CGFtexture } from "../../lib/CGF.js";
import { MyCircle } from "../MyCircle.js";
import { MyCylinder } from "../MyCylinder.js";
import { arraysEqual, getAppearance } from "../utils.js";
import { MyChecker } from "./MyChecker.js";

/**
 * MyRectangle class, representing a rectangle in XY plane.
 */
export class MyCheckerGroup {
    MATERIAL_P1 = {
        shininess: 5,
        emission: [0.05, 0.05, 0.05, 1.0],
        ambient: [0.01, 0.01, 0.01, 1.0],
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

    MATERIAL_SELECTED = {
        shininess: 5,
        emission: [0.2, 0.3, 0.005, 1.0],
        ambient: [0.2, 0.3, 0.005, 1.0],
        diffuse: [0.3, 1.0, 0.1, 1.0],
        specular: [0.8, 1.0, 0.8, 1.0],
    };

    PIECE_HEIGHT = 0.1;
    PIECE_TILE_RATIO = 0.4;

    UNPROMOTED_BASE_TEXTURE = "scenes/images/game/checker_base.png";
    PROMOTED_BASE_TEXTURE = "scenes/images/game/checker_base_crown.png";

    /**
     * @constructor
     * @param scene Reference to MyScene object.
     * @param x1 x coordinate of first point.
     * @param x2 x coordinate of second point.
     * @param y1 y coordinate of first point.
     * @param y2 y coordinate of second point.
     */
    constructor(scene, model, player1, player2, tileSize) {
        const radius = tileSize * this.PIECE_TILE_RATIO;
        const height = this.PIECE_HEIGHT;
        this.scene = scene;
        this.model = model;
        this.textures_p1 = {
            "unpromoted_base": getAppearance(scene, this.MATERIAL_P1, new CGFtexture(scene, this.UNPROMOTED_BASE_TEXTURE)),
            "promoted_base": getAppearance(scene, this.MATERIAL_P1, new CGFtexture(scene, this.PROMOTED_BASE_TEXTURE)),
            "side": getAppearance(scene, this.MATERIAL_P1),
        };

        this.textures_p2 = {
            "unpromoted_base": getAppearance(scene, this.MATERIAL_P2, new CGFtexture(scene, this.UNPROMOTED_BASE_TEXTURE)),
            "promoted_base": getAppearance(scene, this.MATERIAL_P2, new CGFtexture(scene, this.PROMOTED_BASE_TEXTURE)),
            "side": getAppearance(scene, this.MATERIAL_P2),
        };

        this.textures_selected = {
            "unpromoted_base": getAppearance(scene, this.MATERIAL_SELECTED, new CGFtexture(scene, this.UNPROMOTED_BASE_TEXTURE)),
            "promoted_base": getAppearance(scene, this.MATERIAL_SELECTED, new CGFtexture(scene, this.PROMOTED_BASE_TEXTURE)),
            "side": getAppearance(scene, this.MATERIAL_SELECTED),
        }

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
            this.pieces.push(new MyChecker(scene, this.geometries, this.textures_p1, this.textures_selected, this.model, 100 + i, tileSize, radius, height, player1, piece));
        }

        for (let i = 0; i < p2_pieces.length; i++) {
            const piece = p2_pieces[i];
            this.pieces.push(new MyChecker(scene, this.geometries, this.textures_p2, this.textures_selected, this.model, 200 + i, tileSize, radius, height, player2, piece));
        }
    }

    getChecker(x, y) {
        return this.pieces.find((piece) => arraysEqual(piece.boardPosition, [x, y]));
    }

    display() {
        for (let i = 0; i < this.pieces.length; i++) {
            this.pieces[i].display();
        }
    }
}
