import { CGFobject } from '../lib/CGF.js';

export class MyComponent extends CGFobject {
	constructor(scene) {
		super(scene);
		this.children = [];
		this.transformations = [];
	}

	addChild(child) {
		this.children.push(child);
	}

	addTransformation(transformation) {
		this.transformations.push(transformation);
	}
	
	display() {
		this.scene.pushMatrix();
		for (let transformation of this.transformations) {
			this.scene.multMatrix(transformation);
		}

        for (let child of this.children) {
			child.display();
		}

		this.scene.popMatrix();
    }
}

