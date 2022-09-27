import { CGFobject } from '../lib/CGF.js';


export class MyComponent extends CGFobject {
	constructor(scene) {
		super(scene);
		this.children = [];
		this.transformations = [];
		this.materials = [];
		this.currentMaterialIdx = 0;
		this.texture = "none";

		// TODO [texCoords]
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

	addTransformation(transformation) {
		this.transformations.push(transformation);
	}
	
	display() {
		let currentMaterial = this.materials[this.currentMaterialIdx];

		if (currentMaterial != "inherit" || this.texture != "inherit") {
			this.scene.pushAppearance(currentMaterial, this.texture);
		}
		
		this.scene.pushMatrix();
		for (let transformation of this.transformations) {
			this.scene.multMatrix(transformation);
		}

        for (let child of this.children) {
			child.display();
		}

		this.scene.popMatrix();
		if (currentMaterial != "inherit" || this.texture != "inherit") {
			this.scene.popAppearance();
		}
    }
}

