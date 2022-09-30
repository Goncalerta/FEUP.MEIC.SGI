import { CGFobject } from '../lib/CGF.js';
import { MyRectangle } from './MyRectangle.js';
import { MyTriangle } from './MyTriangle.js';


export class MyComponent extends CGFobject {
	constructor(scene) {
		super(scene);
		this.children = [];
		this.transformations = [];
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
			if (child instanceof MyRectangle || child instanceof MyTriangle) {
				child.updateLengthST(this.length_s, this.length_t);
			} else if (child instanceof MyComponent) {
				child.ifInheritSetLengths(this.length_s, this.length_t);
			}

			child.display();
		}

		this.scene.popMatrix();
		if (currentMaterial != "inherit" || this.texture != "inherit") {
			this.scene.popAppearance();
		}
    }

	ifInheritSetLengths(parent_length_s, parent_length_t) {
		if (this.texture == "inherit") {
			this.length_s = parent_length_s;
			this.length_t = parent_length_t;
		}
	}

}

