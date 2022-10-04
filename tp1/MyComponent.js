import { CGFobject } from '../lib/CGF.js';

export class MyComponent extends CGFobject {
    constructor(scene) {
        super(scene);
        this.children = [];
        this.transformation = null;
        this.materials = [];
        this.currentMaterialIdx = 0;
        this.texture = "none";

        this.length_s = 1.0;
        this.length_t = 1.0;
    }

    inheritMaterial() {
        this.materials.push("inherit");
    }

    addMaterial(material) {
        this.materials.push(material);
    }

    setTexture(texture, length_s, length_t) {
        this.texture = texture;
        this.length_s = length_s;
        this.length_t = length_t;
    }

    inheritTexture() {
        this.texture = "inherit";
    }

    toggleMaterial() {
        this.currentMaterialIdx = (this.currentMaterialIdx + 1) % this.materials.length;
    }

    addChild(child) {
        this.children.push(child);
    }

    setTransformation(transformation) {
        this.transformation = transformation;
    }
    
    display() {
        let currentMaterial = this.materials[this.currentMaterialIdx];
        if (currentMaterial != "inherit" || this.texture != "inherit") {
            this.scene.pushAppearance(currentMaterial, this.texture);
        }
        
        if (this.transformation != null) {
            this.scene.pushMatrix();
            this.scene.multMatrix(this.transformation);
        }

        for (let child of this.children) {
            child.updateTexCoords(this.length_s, this.length_t);
            child.display();
        }

        if (this.transformation != null) {
            this.scene.popMatrix();
        }

        if (currentMaterial != "inherit" || this.texture != "inherit") {
            this.scene.popAppearance();
        }
    }

    updateTexCoords(parent_length_s, parent_length_t) {
        if (this.texture == "inherit") {
            this.length_s = parent_length_s;
            this.length_t = parent_length_t;
        }
    }

}
