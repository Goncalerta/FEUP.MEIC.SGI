import { CGFobject } from '../lib/CGF.js';

export class MyComponent extends CGFobject {
	constructor(scene) {
		super(scene);
		this.children = [];
		this.transformations = [];
		this.materials = [];
		this.currentMaterialIdx = 0;
	}

	inheritMaterial() {
		this.materials.push("inherit");
	}

	addMaterial(material) {
		this.materials.push(material);
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
		if (currentMaterial != "inherit") {
			this.scene.pushMaterial(currentMaterial);
		}
		
		this.scene.pushMatrix();
		for (let transformation of this.transformations) {
			this.scene.multMatrix(transformation);
		}

        for (let child of this.children) {
			child.display();
		}

		this.scene.popMatrix();
		if (currentMaterial != "inherit") {
			this.scene.popMaterial();
		}
    }
}

