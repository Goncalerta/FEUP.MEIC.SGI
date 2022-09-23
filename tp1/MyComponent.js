import { CGFobject } from '../lib/CGF.js';

export class MyComponent extends CGFobject {
	constructor(scene) {
		super(scene);
		this.children = [];
	}

	addChild(child) {
		this.children.push(child);
	}
	
	display() {
        for (let child of this.children) {
			child.display();
		}
    }
}

