import {CGFscene, CGFtexture} from '../lib/CGF.js';
import {CGFaxis, CGFcamera} from '../lib/CGF.js';
import {CGFappearance} from '../lib/CGF.js';
import {subtractVectors} from './utils.js';

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        // interface letiables
        this.selectedView = 0;
        this.light0 = false;
        this.light1 = false;
        this.light2 = false;
        this.light3 = false;
        this.light4 = false;
        this.light5 = false;
        this.light6 = false;
        this.light7 = false;

        this.appearanceStack = [];
        this.fallbackMaterial = {
            shininess: 10,
            emission: [0.0, 0.0, 0.0, 1.0],
            ambient: [0.8, 0.8, 0.8, 1.0],
            diffuse: [1.0, 1.0, 1.0, 1.0],
            specular: [0.0, 0.0, 0.0, 1.0],
        };

        this.sceneInited = false;

        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(100);
    }

    /**
     * Initializes the fallback scene camera when scene file did not correctly declare any.
     */
    initCameras() {
        this.camera = new CGFcamera(
            0.4,
            0.1,
            500,
            vec3.fromValues(30, 30, 30),
            vec3.fromValues(0, 0, 0)
        );
    }

    /**
     * Changes the camera that is currently active.
     */
    setCamera(camera) {
        if (camera != null) {
            this.camera = camera;
            if (this.interface) this.interface.setActiveCamera(this.camera);
        }
    }

    /**
     * Updates lights according to whether they should be enabled or disabled.
     */
    updateLights() {
        let i = 0;
        for (const _ in this.graph.lights) {
            if (i >= 8) {
                break;
            }

            if (this['light' + i]) {
                this.lights[i].enable();
            } else {
                this.lights[i].disable();
            }
            this.lights[i].update();
            i++;
        }
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        // Lights index.
        let i = 0;

        // Reads the lights from the scene graph.
        for (const key in this.graph.lights) {
            if (i >= 8) {
                // Only eight lights allowed by WebGL.
                console.warn(
                    'Warning: more than 8 lights defined in the scene. Only the first 8 will be used.'
                );
                break;
            }

            if (this.graph.lights.hasOwnProperty(key)) {
                const light = this.graph.lights[key];

                this.lights[i].setPosition(
                    light[2][0],
                    light[2][1],
                    light[2][2],
                    light[2][3]
                );
                this.lights[i].setAmbient(
                    light[3][0],
                    light[3][1],
                    light[3][2],
                    light[3][3]
                );
                this.lights[i].setDiffuse(
                    light[4][0],
                    light[4][1],
                    light[4][2],
                    light[4][3]
                );
                this.lights[i].setSpecular(
                    light[5][0],
                    light[5][1],
                    light[5][2],
                    light[5][3]
                );
                this.lights[i].setConstantAttenuation(light[6][0]);
                this.lights[i].setLinearAttenuation(light[6][1]);
                this.lights[i].setQuadraticAttenuation(light[6][2]);

                if (light[1] == 'spot') {
                    this.lights[i].setSpotCutOff(light[7]);
                    this.lights[i].setSpotExponent(light[8]);

                    const dir = subtractVectors(light[9], light[2].slice(0, 3));
                    this.lights[i].setSpotDirection(...dir);
                }

                if (light[0]) {
                    this.lights[i].enable();
                    this['light' + i] = true;
                } else {
                    this.lights[i].disable();
                }

                this.lights[i].update();

                i++;
            }
        }
    }

    /**
     * Sets the fallback default appearance.
     */
    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }
    /** Handler called when the graph is finally loaded.
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(
            this.graph.background[0],
            this.graph.background[1],
            this.graph.background[2],
            this.graph.background[3]
        );

        this.setGlobalAmbientLight(
            this.graph.ambient[0],
            this.graph.ambient[1],
            this.graph.ambient[2],
            this.graph.ambient[3]
        );

        this.initLights();

        // Interface controls and key bindings
        this.interface.gui
            .add(this, 'selectedView', this.graph.cameraIds)
            .name('Selected Camera')
            .onChange(() =>
                this.setCamera(this.graph.cameras[this.selectedView])
            );
        let i = 0;
        for (const lightId in this.graph.lights) {
            this.interface.gui
                .add(this, 'light' + i)
                .name(lightId)
                .onChange(() => this.updateLights());
            i++;
        }
        this.interface.onClick('KeyM', () => this.toggleMaterial());

        this.sceneInited = true;
    }

    /**
     * Toggles the material of every component in the scene graph.
     */
    toggleMaterial() {
        for (const componentId of this.graph.componentsIds) {
            this.graph.components[componentId].toggleMaterial();
        }
    }

    /**
     * Adds an appearance to the appearance stack and applies it.
     * @param material the material properties.
     * May be the string "inherit" or an object with shininess, emission, ambient, diffuse and specular properties.
     * @param texture the texture to be applied. May be a CGFtexture object, the string "inherit" or the string "none".
     */
    pushAppearance(material, texture) {
        const newAppearance = new CGFappearance(this);
        if (material == null) {
            material = 'inherit';
        }
        if (texture == null) {
            texture = 'none';
        }
        if (material == 'inherit') {
            if (this.appearanceStack.length > 0) {
                // Inherit means the material is the same as the previous one in the stack.
                material = this.appearanceStack[this.appearanceStack.length - 1].material;
            } else {
                // No previous material, so fallback to a default one.
                material = this.fallbackMaterial;
            }
        }
        if (texture == 'inherit') {
            if (this.appearanceStack.length > 0) {
                // Inherit means the texture is the same as the previous one in the stack.
                texture = this.appearanceStack[this.appearanceStack.length - 1].texture;
            } else {
                // If the stack is empty, inherit no texture.
                texture = 'none';
            }
        }

        newAppearance.setEmission(...material.emission);
        newAppearance.setAmbient(...material.ambient);
        newAppearance.setDiffuse(...material.diffuse);
        newAppearance.setSpecular(...material.specular);
        newAppearance.setShininess(material.shininess);

        // Add texture unless its none.
        if (texture != 'none') {
            newAppearance.setTexture(texture);
            newAppearance.setTextureWrap('REPEAT', 'REPEAT');
        }

        // Apply appearance.
        newAppearance.apply();

        // Push appearance and its properties to stack, since it may need to be reused.
        this.appearanceStack.push({
            material: material,
            texture: texture,
            appearance: newAppearance,
        });
    }

    /**
     * Removes an appearance from the appearance stack and applies the previous one if there is any.
     */
    popAppearance() {
        if (this.appearanceStack.length == 0) {
            console.error('Error: No appearance in stack.');
            return;
        }
        this.appearanceStack.pop();
        if (this.appearanceStack.length > 0) {
            this.appearanceStack[this.appearanceStack.length - 1].appearance.apply();
        }
    }

    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();
        this.axis.display();

        for (let i = 0; i < this.lights.length; i++) {
            this.lights[i].setVisible(true);
            this.lights[i].update();
        }

        if (this.sceneInited) {
            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}
