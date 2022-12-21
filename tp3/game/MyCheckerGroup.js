import { CGFtexture } from "../../lib/CGF.js";
import { MyCircle } from "../MyCircle.js";
import { MyCylinder } from "../MyCylinder.js";
import { getAppearance } from "../utils.js";
import { MyChecker } from "./MyChecker.js";

/**
 * MyRectangle class, representing a rectangle in XY plane.
 */
export class MyCheckerGroup {
    MATERIAL = {
        shininess: 10,
        emission: [0.3, 0.24, 0.24, 1.0],
        ambient: [0.7, 0.6, 0.6, 1.0],
        diffuse: [0.9, 0.7, 0.7, 1.0],
        specular: [0.8, 0.6, 0.6, 1.0],
    };

    PIECE_HEIGHT = 0.1;
    PIECE_TILE_RATIO = 0.4;

    UNPROMOTED_BASE_TEXTURE = "scenes/images/game/checker_base.png";
    PROMOTED_BASE_TEXTURE = "scenes/images/game/checker_base_crown.png";
    SIDE_TEXTURE = "scenes/images/game/checker_side.png";

    /**
     * @constructor
     * @param scene Reference to MyScene object.
     * @param x1 x coordinate of first point.
     * @param x2 x coordinate of second point.
     * @param y1 y coordinate of first point.
     * @param y2 y coordinate of second point.
     */
    constructor(scene, model, tileSize) {
        const radius = tileSize * this.PIECE_TILE_RATIO;
        const height = this.PIECE_HEIGHT;
        this.scene = scene;
        this.model = model;
        this.textures_p1 = {
            "unpromoted_base": getAppearance(scene, this.MATERIAL, new CGFtexture(scene, this.UNPROMOTED_BASE_TEXTURE)),
            "promoted_base": getAppearance(scene, this.MATERIAL, new CGFtexture(scene, this.PROMOTED_BASE_TEXTURE)),
            "side": getAppearance(scene, this.MATERIAL, new CGFtexture(scene, this.SIDE_TEXTURE)),
        };

        this.textures_p2 = {
            "unpromoted_base": getAppearance(scene, this.MATERIAL, new CGFtexture(scene, this.UNPROMOTED_BASE_TEXTURE)),
            "promoted_base": getAppearance(scene, this.MATERIAL, new CGFtexture(scene, this.PROMOTED_BASE_TEXTURE)),
            "side": getAppearance(scene, this.MATERIAL, new CGFtexture(scene, this.SIDE_TEXTURE)),
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
            piece[0] = (piece[0] - 3.5) * tileSize;
            piece[1] = -(piece[1] - 3.5) * tileSize;
            this.pieces.push(new MyChecker(scene, this.geometries, this.textures_p1, 100 + i, height, 1, piece));
        }

        for (let i = 0; i < p2_pieces.length; i++) {
            const piece = p2_pieces[i];
            piece[0] = (piece[0] - 3.5) * tileSize;
            piece[1] = -(piece[1] - 3.5) * tileSize;
            this.pieces.push(new MyChecker(scene, this.geometries, this.textures_p2, 200 + i, height, 2, piece));
        }
    }

    display() {
        for (let i = 0; i < this.pieces.length; i++) {
            this.pieces[i].display();
        }
    }
}
