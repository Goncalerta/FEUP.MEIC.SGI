import {CGFobject} from '../lib/CGF.js';

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
        this.componentChildren = [];
        this.primitiveChildren = [];
        this.transformation = null;
        this.materials = [];
        this.currentMaterialIdx = 0; // Currently selected material, changes when pressing 'M'

        this.texture = 'none';
        this.lengthS = 1.0;
        this.lengthT = 1.0;

        this.highlightable = false;
        this.highlightedColor = null;
        this.highlightedScale = null;
        this.highlighted = false;
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
        this.materials.push('inherit');
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
     * @param lengthS factor of scaling s
     * @param lenght_t factor of scaling t
     */
    setTexture(texture, lengthS = 1.0, lengthT = 1.0) {
        this.texture = texture;
        this.lengthS = lengthS;
        this.lengthT = lengthT;
    }

    /**
     * Sets the texture of this component to inherit its father.
     */
    inheritTexture() {
        this.texture = 'inherit';
    }

    /**
     * Changes the current material to the next one in the list.
     */
    toggleMaterial() {
        this.currentMaterialIdx =
            (this.currentMaterialIdx + 1) % this.materials.length;
    }

    /**
     * Appends a new primitive child to the component.
     * @param {CGFobject} child the primitive to append.
     */
    addPrimitiveChild(child) {
        this.primitiveChildren.push(child);
    }

    /**
     * Appends a new component child to the component.
     * @param {MyComponent} child the component to append.
     */
    addComponentChild(child) {
        this.componentChildren.push(child);
    }

    /**
     * Gets the current children of the component
     */
    getComponentChildren() {
        return this.componentChildren;
    }

    /**
     * Returns whether this component has children or not.
     */
    hasChildren() {
        return this.componentChildren.length > 0 || this.primitiveChildren.length > 0
    }

    /**
     * Sets the transformation of this component.
     * @param transformation the transformation to set.
     */
    setTransformation(transformation) {
        this.transformation = transformation;
    }

    /**
     * Sets the highlight properties of this component.
     * @param {Float32Array} color the color of the highlight
     * @param scale_h the scale factor in the extreme state of the pulsing
     */
    setHighlighting(color, scale_h) {
        this.highlightable = true;
        this.highlightedColor = color;
        this.highlightedScale = scale_h;
    }

    /**
     * Sets whether this component is highlighted or not.
     * @param {boolean} highlighted whether this component is highlighted or not.
     */
    setHighlighted(highlighted) {
        this.highlighted = highlighted;
    }

    /**
     * Returns whether this component is highlightable, that is, if it has highlighting properties
     * and at least one direct primitive child.
     * @returns {boolean} whether this component is highlightable or not.
     */
    isHighlightable() {
        return this.highlightable && this.primitiveChildren.length > 0;
    }

    /**
     * Sets the animation of this component.
     * @param animation the animation to set.
     */
    setAnimation(animation) {
        this.animation = animation;
    }

    /**
     * Displays this component in the scene.
     */
    display() {
        // Only adds a new appearance to the scene if different from its father, for efficiency purposes.
        const currentMaterial = this.materials[this.currentMaterialIdx];
        if (currentMaterial != 'inherit' || this.texture != 'inherit') {
            this.scene.pushAppearance(currentMaterial, this.texture);
        }

        // Save current transformation matrix state if this component has transformations
        if (this.animation != null || this.transformation != null) {
            this.scene.pushMatrix();
        }

        // Apply transformation if there is one
        if (this.transformation != null) {
            this.scene.multMatrix(this.transformation);
        }

        // Apply animation if there is one
        if (this.animation != null) {
            this.animation.apply();
        }

        if (this.animation == null || this.animation.isVisible()) {
            // Display all component children
            for (const child of this.componentChildren) {
                child.updateTexCoords(this.lengthS, this.lengthT);
                child.display();
            }

            // Activate or deactivate highlight shader to display highlighted primitives.
            // For efficiency purposes, the shader does not change if the component does
            // not have any primitive children.
            if (this.primitiveChildren.length > 0) {
                this.scene.toggleHighlightShader(this.highlighted, this.highlightedColor, this.highlightedScale);
            }

            // Display all direct primitive children
            for (const child of this.primitiveChildren) {
                child.updateTexCoords(this.lengthS, this.lengthT);
                child.display();
            }
        }
        
        // Undo transformation if it was applied
        if (this.animation != null || this.transformation != null) {
            this.scene.popMatrix();
        }

        // Remove the appearance if it was added
        if (currentMaterial != 'inherit' || this.texture != 'inherit') {
            this.scene.popAppearance();
        }
    }

    /**
     * Updates TexCoords by its father component. Only relevant in inherit textures.
     * 
     * @param lengthS
     * @param lengthT
     */
    updateTexCoords(parentLengthS, parentLengthT) {
        if (this.texture == 'inherit') {
            this.lengthS = parentLengthS;
            this.lengthT = parentLengthT;
        }
    }

    /**
     * Updates component and children animations.
     * 
     * @param t updated time
     */
    update(t) {
        if (this.animation != null) {
            this.animation.update(t);
        }

        for (const child of this.componentChildren) {
            child.update(t);
        }
    }
}
