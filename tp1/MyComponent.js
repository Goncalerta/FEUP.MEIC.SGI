import { CGFobject } from "../lib/CGF.js";

/**
 * MyComponent class, representing a component that contains primitives and other components
 */
export class MyComponent extends CGFobject {
    /**
     * @constructor
     * @param {CGFscene} scene - Reference to MyScene object
     * @param {string} id - Id of the component
     */
    constructor(scene, id) {
        super(scene);

        this.id = id;
        this.children = [];
        this.transformation = null;
        this.materials = [];
        this.currentMaterialIdx = 0;

        this.texture = "none";
        this.length_s = 1.0;
        this.length_t = 1.0;
    }

    /**
     * Gets the id of the component
     */
    getId() {
        return this.id;
    }

    /**
     * Adds a material to this component that inherits from parent.
     */
    inheritMaterial() {
        this.materials.push("inherit");
    }

    /**
     * Adds a material to this component.
     * @param material the material properties.
     * @param material.shininess
     * @param material.emission
     * @param material.ambient
     * @param material.diffuse
     * @param material.specular
     */
    addMaterial(material) {
        this.materials.push(material);
    }

    /**
     * Sets the texture of this component.
     * @param {CGFtexture} texture the texture to set.
     * @param length_s factor of scaling s
     * @param lenght_t factor of scaling t
     */
    setTexture(texture, length_s = 1.0, length_t = 1.0) {
        this.texture = texture;
        this.length_s = length_s;
        this.length_t = length_t;
    }

    /**
     * Sets the texture of this component to inherit its father.
     */
    inheritTexture() {
        this.texture = "inherit";
    }

    /**
     * Changes the current material to the next one in the list.
     */
    toggleMaterial() {
        this.currentMaterialIdx =
            (this.currentMaterialIdx + 1) % this.materials.length;
    }

    /**
     * Appends a new child to the component.
     * @param child a component or primitive to append.
     */
    addChild(child) {
        this.children.push(child);
    }

    /**
     * Gets the current children of the component
     */
    getChildren() {
        return this.children;
    }

    /**
     * Sets the transformation of this component.
     * @param transformation the transformation to set.
     */
    setTransformation(transformation) {
        this.transformation = transformation;
    }

    /**
     * Displays this component in the scene.
     */
    display() {
        // Only adds a new appearance to the scene if different from its father, for efficiency purposes.
        let currentMaterial = this.materials[this.currentMaterialIdx];
        if (currentMaterial != "inherit" || this.texture != "inherit") {
            this.scene.pushAppearance(currentMaterial, this.texture);
        }

        // Apply transformation if there is one
        if (this.transformation != null) {
            this.scene.pushMatrix();
            this.scene.multMatrix(this.transformation);
        }

        // Display all children
        for (let child of this.children) {
            child.updateTexCoords(this.length_s, this.length_t);
            child.display();
        }

        // Undo transformation if it was applied
        if (this.transformation != null) {
            this.scene.popMatrix();
        }

        // Remove the appearance if it was added
        if (currentMaterial != "inherit" || this.texture != "inherit") {
            this.scene.popAppearance();
        }
    }

    // Updates TexCoords by its father component. Only relevant in inherit textures.
    updateTexCoords(parent_length_s, parent_length_t) {
        if (this.texture == "inherit") {
            this.length_s = parent_length_s;
            this.length_t = parent_length_t;
        }
    }
}
