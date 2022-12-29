import {CGFcamera, CGFcameraOrtho, CGFXMLreader} from '../lib/CGF.js';
import {MyCylinder} from './MyCylinder.js';
import {MyRectangle} from './MyRectangle.js';
import {MySphere} from './MySphere.js';
import {MyTorus} from './MyTorus.js';
import {MyTriangle} from './MyTriangle.js';
import {MyComponent} from './MyComponent.js';
import {MyPatch} from './MyPatch.js';
import {CGFtexture} from '../lib/CGF.js';
import { MyKeyframeAnimation } from './animations/MyKeyframeAnimation.js';
import { MyTransformation, Transformations } from './animations/MyTransformation.js';
import { MyKeyframe } from './animations/MyKeyframe.js';
import { degreeToRad } from './utils.js';


const SECONDS_TO_MILLISECONDS = 1000;

// Order of the groups in the XML document.
const SCENE_INDEX = 0;
const VIEWS_INDEX = 1;
const AMBIENT_INDEX = 2;
const LIGHTS_INDEX = 3;
const TEXTURES_INDEX = 4;
const MATERIALS_INDEX = 5;
const TRANSFORMATIONS_INDEX = 6;
const PRIMITIVES_INDEX = 7;
const ANIMATIONS_INDEX = 8;
const COMPONENTS_INDEX = 9;

/**
 * MySceneGraph class, representing the scene graph.
 */
export class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null; // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Returns a list with all highlitable components in this scene graph.
     */
    getHighlightableComponents() {
        let highlitableComponents = [];
        for (let componentId of this.componentsIds) {
            if (this.components[componentId].isHighlightable()) {
                highlitableComponents.push(this.components[componentId]);
            }
        }
        return highlitableComponents;
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log('XML Loading finished.');
        const rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the letious blocks
        const error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization
        // depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != 'sxs') return 'root tag <sxs> missing';

        const nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        const nodeNames = [];

        for (let i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        if (nodeNames.indexOf('parsererror') != -1) {
            this.onXMLError(
                'Parser error: ' + nodes[nodeNames.indexOf('parsererror')].innerText
            );
        }

        let error;

        // Processes each node, verifying errors.

        // <scene>
        let index;
        if ((index = nodeNames.indexOf('scene')) == -1) {
            this.onXMLError('tag <scene> missing');
        } else {
            if (index != SCENE_INDEX) {
                this.onXMLMinorError('tag <scene> out of order ' + index);
            }

            // Parse scene block
            if ((error = this.parseScene(nodes[index])) != null) return error;
        }

        // <views>
        if ((index = nodeNames.indexOf('views')) == -1) {
            this.onXMLError('tag <views> missing');
        } else {
            if (index != VIEWS_INDEX) {
                this.onXMLMinorError('tag <views> out of order ' + index);
            }

            // Parse views block
            if ((error = this.parseView(nodes[index])) != null) return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf('ambient')) == -1) {
            this.onXMLError('tag <ambient> missing');
            this.ambient = [0, 0, 0, 1];
            this.background = [0, 0, 0, 1];
        } else {
            if (index != AMBIENT_INDEX) {
                this.onXMLMinorError('tag <ambient> out of order ' + index);
            }

            // Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null) return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf('lights')) == -1) {
            this.onXMLError('tag <lights> missing');
        } else {
            if (index != LIGHTS_INDEX) {
                this.onXMLMinorError('tag <lights> out of order ' + index);
            }

            // Parse lights block
            if ((error = this.parseLights(nodes[index])) != null) return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf('textures')) == -1) {
            this.onXMLError('tag <textures> missing');
            this.textures = [];
        } else {
            if (index != TEXTURES_INDEX) {
                this.onXMLMinorError('tag <textures> out of order ' + index);
            }

            // Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null) {
                return error;
            }
        }

        // <materials>
        if ((index = nodeNames.indexOf('materials')) == -1) {
            this.onXMLError('tag <materials> missing');
            this.materials = [];
        } else {
            if (index != MATERIALS_INDEX) {
                this.onXMLMinorError('tag <materials> out of order ' + index);
            }

            // Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null) {
                return error;
            }
        }

        // <transformations>
        if ((index = nodeNames.indexOf('transformations')) == -1) {
            this.onXMLError('tag <transformations> missing');
            this.transformations = [];
        } else {
            if (index != TRANSFORMATIONS_INDEX) {
                this.onXMLMinorError(
                    'tag <transformations> out of order ' + index
                );
            }

            // Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null) {
                return error;
            }
        }

        // <primitives>
        if ((index = nodeNames.indexOf('primitives')) == -1) {
            this.onXMLError('tag <primitives> missing');
            this.primitives = [];
        } else {
            if (index != PRIMITIVES_INDEX) {
                this.onXMLMinorError('tag <primitives> out of order ' + index);
            }

            // Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null) {
                return error;
            }
        }

        // <animations>
        if ((index = nodeNames.indexOf('animations')) == -1) {
            this.onXMLError('tag <animations> missing');
            this.animations = [];
        } else {
            if (index != ANIMATIONS_INDEX) {
                this.onXMLMinorError('tag <animations> out of order ' + index);
            }

            // Parse animations block
            if ((error = this.parseAnimations(nodes[index])) != null) {
                return error;
            }
        }

        // <components>
        if ((index = nodeNames.indexOf('components')) == -1) {
            this.onXMLError('tag <components> missing');
            this.components = [];
        } else {
            if (index != COMPONENTS_INDEX) {
                this.onXMLMinorError('tag <components> out of order ' + index);
            }

            // Parse components block
            if ((error = this.parseComponents(nodes[index])) != null) {
                return error;
            }
        }

        if (this.components[this.idRoot] == null) {
            this.onXMLError('no root component found');
        }
        this.log('all parsed');
    }

    /**
     * Parses the <scene> block.
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {
        // Get root of the scene.
        const root = this.reader.getString(sceneNode, 'root', false);

        this.idRoot = root;

        // Get axis length
        let axisLength = this.reader.getFloat(sceneNode, 'axis_length', false);
        if (axisLength == null) {
            axisLength = 1;
            this.onXMLMinorError(
                'no axis_length defined for scene; assuming \'length = 1\''
            );
        }

        this.referenceLength = axisLength;

        this.log('Parsed scene');

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {
        this.cameras = {};
        this.cameraIds = [];

        //  <views default="ss" >
        //      <perspective id="ss" near="ff" far="ff" angle="ff">
        //          <from x="ff" y="ff" z="ff" />
        //          <to x="ff" y="ff" z="ff" />
        //      </perspective>
        //      <ortho id="ss"  near="ff" far="ff" left="ff" right="ff" top="ff" bottom="ff" >
        //          <from x="ff" y="ff" z="ff" />
        //          <to x="ff" y="ff" z="ff" />
        //          <up x="ff" y="ff" z="ff" /> <!-- opcional, default 0,1,0 -->
        //      </ortho>
        //  </views>

        // default
        this.scene.selectedView = this.reader.getString(viewsNode, 'default', false);
        if (this.scene.selectedView == null) {
            this.onXMLError('no default view defined for views');
        }

        const children = viewsNode.children;
        for (let i = 0; i < children.length; i++) {
            if (
                children[i].nodeName == 'perspective' ||
                children[i].nodeName == 'ortho'
            ) {
                // id
                const viewId = this.reader.getString(children[i], 'id', false);
                if (viewId == null) {
                    this.onXMLMinorError('unable to parse id for view');
                    continue;
                }

                // Checks for repeated IDs.
                if (this.cameras[viewId] != null) {
                    this.onXMLMinorError(
                        'ID must be unique for each view (conflict: ID = ' + viewId + ')'
                    );
                    continue;
                }

                // near
                const near = this.reader.getFloat(children[i], 'near', false);
                if (!(near != null && !isNaN(near))) {
                    this.onXMLMinorError(
                        'unable to parse near attribute of view with ID = ' + viewId
                    );
                    continue;
                }

                // far
                const far = this.reader.getFloat(children[i], 'far', false);
                if (!(far != null && !isNaN(far))) {
                    this.onXMLMinorError(
                        'unable to parse far attribute of view with ID = ' + viewId
                    );
                    continue;
                }

                const grandChildren = children[i].children;
                if (grandChildren.length < 2 || grandChildren.length > 3) {
                    this.onXMLMinorError(
                        'unable to parse children nodes of view with ID = ' + viewId +
                        ': wrong number of children (' + grandChildren.length + ')'
                    );
                    continue;
                }

                const nodeNames = [];
                for (let j = 0; j < grandChildren.length; j++) {
                    nodeNames.push(grandChildren[j].nodeName);
                }

                // from & to
                let fromToPositions = [];
                for (const grandChildrenName of ['from', 'to']) {
                    const attributeIndex = nodeNames.indexOf(grandChildrenName);

                    if (attributeIndex != -1) {
                        const pos = this.parseCoordinates3D(
                            grandChildren[attributeIndex],
                            'view position for ID' + viewId
                        );

                        if (!Array.isArray(pos)) {
                            this.onXMLMinorError(
                                'unable to parse ' + grandChildrenName + ' coordinates of view with ID = ' + viewId
                            );
                            fromToPositions = [
                                [1, 1, 1],
                                [0, 0, 0],
                            ];
                            break;
                        }

                        fromToPositions.push(pos);
                    } else {
                        this.onXMLMinorError(
                            'unable to parse ' + grandChildrenName + ' coordinates of view with ID = ' + viewId
                        );
                        fromToPositions = [
                            [1, 1, 1],
                            [0, 0, 0],
                        ];
                        break;
                    }
                }

                if (children[i].nodeName == 'perspective') {
                    if (nodeNames.length != 2) {
                        this.onXMLMinorError(
                            'invalid number of children of perspective view with ID = ' + viewId
                        );
                        continue;
                    }

                    // angle
                    const angle = this.reader.getFloat(children[i], 'angle', false);
                    if (!(angle != null && !isNaN(angle))) {
                        this.onXMLMinorError(
                            'unable to parse angle attribute of view with ID = ' + viewId
                        );
                        continue;
                    }

                    // Add the new perspective camera
                    this.cameras[viewId] = new CGFcamera(
                        degreeToRad(angle), near, far,
                        fromToPositions[0], fromToPositions[1]
                    );
                } else {
                    // == "ortho"
                    if (nodeNames.length < 2 || nodeNames.length > 3) {
                        this.onXMLMinorError(
                            'invalid number of children of view with ID = ' + viewId
                        );
                        continue;
                    }

                    // left
                    const left = this.reader.getFloat(children[i], 'left', false);
                    if (!(left != null && !isNaN(left))) {
                        this.onXMLMinorError(
                            'unable to parse left attribute of view with ID = ' + viewId
                        );
                        continue;
                    }

                    // right
                    const right = this.reader.getFloat(children[i], 'right', false);
                    if (!(right != null && !isNaN(right))) {
                        this.onXMLMinorError(
                            'unable to parse right attribute of view with ID = ' + viewId
                        );
                        continue;
                    }

                    // top
                    const top = this.reader.getFloat(children[i], 'top', false);
                    if (!(top != null && !isNaN(top))) {
                        this.onXMLMinorError(
                            'unable to parse top attribute of view with ID = ' + viewId
                        );
                        continue;
                    }

                    // bottom
                    const bottom = this.reader.getFloat(children[i], 'bottom', false);
                    if (!(bottom != null && !isNaN(bottom))) {
                        this.onXMLMinorError(
                            'unable to parse bottom attribute of view with ID = ' + viewId
                        );
                        continue;
                    }

                    // up
                    let up = [0, 1, 0]; // default value
                    const upAttributeIndex = nodeNames.indexOf('up');
                    if (upAttributeIndex != -1) {
                        const pos = this.parseCoordinates3D(
                            grandChildren[upAttributeIndex],
                            'view position for ID' + viewId
                        );

                        if (!Array.isArray(pos)) {
                            this.onXMLMinorError(
                                'unable to parse up coordinates of view with ID = ' + viewId
                            );
                        } else {
                            up = pos;
                        }
                    }

                    // Add the new ortho camera
                    this.cameras[viewId] = new CGFcameraOrtho(
                        left, right, bottom, top, near, far,
                        fromToPositions[0], fromToPositions[1], up
                    );
                }
                this.cameraIds.push(viewId);
            } else {
                this.onXMLMinorError(
                    'unknown tag <' + children[i].nodeName + '>'
                );
                continue;
            }
        }

        const defaultCamera = this.cameras[this.scene.selectedView];
        if (defaultCamera != null) {
            this.scene.setCamera(defaultCamera);
        } else {
            this.onXMLError(
                'default camera with ID = ' + this.scene.selectedView + ' not found'
            );
        }

        this.log('Parsed views and created cameras.');

        return null;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */

    parseAmbient(ambientsNode) {
        const children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        const nodeNames = [];

        for (let i = 0; i < children.length; i++) {
            nodeNames.push(children[i].nodeName);
        }

        const ambientIndex = nodeNames.indexOf('ambient');
        const backgroundIndex = nodeNames.indexOf('background');

        let color = this.parseColor(children[ambientIndex], 'ambient');
        if (!Array.isArray(color)) {
            this.onXMLError('unable to parse ambient color ' + color);
        } else this.ambient = color;

        color = this.parseColor(children[backgroundIndex], 'background');
        if (!Array.isArray(color)) {
            this.onXMLError('unable to parse background color ' + color);
        } else this.background = color;

        this.log('Parsed ambient');

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        const children = lightsNode.children;

        this.lights = [];
        let numLights = 0;

        let grandChildren = [];
        let nodeNames = [];

        // Any number of lights.
        for (let i = 0; i < children.length; i++) {
            // Storing light information
            const global = [];
            const attributeNames = [];
            const attributeTypes = [];

            // Check type of light
            if (
                children[i].nodeName != 'omni' &&
                children[i].nodeName != 'spot'
            ) {
                this.onXMLMinorError(
                    'unknown tag <' + children[i].nodeName + '>'
                );
                continue;
            } else {
                attributeNames.push(
                    ...['location', 'ambient', 'diffuse', 'specular', 'attenuation']
                );
                attributeTypes.push(...['position', 'color', 'color', 'color', 'attenuation']);
            }

            // Get id of the current light.
            const lightId = this.reader.getString(children[i], 'id', false);
            if (lightId == null) {
                this.onXMLMinorError('no ID defined for light');
                continue;
            }

            // Checks for repeated IDs.
            if (this.lights[lightId] != null) {
                this.onXMLMinorError('ID must be unique for each light (conflict: ID = ' + lightId + ')');
                continue;
            }

            // Light enable/disable
            let aux = this.reader.getBoolean(children[i], 'enabled', false);
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false))) {
                this.onXMLMinorError(
                    'unable to parse value component of the \'enable light\' field for ID = ' + lightId + '; assuming \'value = 0\''
                );
            }
            const enableLight = aux;

            // Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (let j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (let j = 0; j < attributeNames.length; j++) {
                const attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeTypes[j] == 'position') {
                    if (attributeIndex != -1) {
                        aux = this.parseCoordinates4D(
                            grandChildren[attributeIndex],
                            'light position for ID' + lightId
                        );
                    } else {
                        aux = [0, 0, 0, 1];
                        this.onXMLMinorError(
                            'light ' + attributeNames[j] + ' undefined for ID = ' + lightId + '\nassuming ' + aux
                        );
                    }
                } else if (attributeTypes[j] == 'attenuation') {
                    if (attributeIndex != -1) {
                        let constant = this.reader.getFloat(grandChildren[attributeIndex], 'constant', false);
                        let linear = this.reader.getFloat(grandChildren[attributeIndex], 'linear', false);
                        let quadratic = this.reader.getFloat(grandChildren[attributeIndex], 'quadratic', false);

                        const sortedValues = [constant, linear, quadratic].sort();

                        if (!(constant != null && !isNaN(constant) &&
                            linear != null && !isNaN(linear) &&
                            quadratic != null && !isNaN(quadratic))) {
                            this.onXMLMinorError(
                                'unable to parse \'attenuation\' for ID = ' + lightId + '; assuming constant = 1.0; linear = 0.0; quadratic = 0.0;'
                            );
                            constant = 1.0;
                            linear = 0.0;
                            quadratic = 0.0;
                        } else if (!(sortedValues[0] == 0.0 && sortedValues[1] == 0.0 && sortedValues[2] == 1.0)) {
                            this.onXMLMinorError(
                                'invalid values for attenuation (only one is "1.0", the others are "0.0") for ID = ' + lightId +
                                '; assuming constant = 1.0; linear = 0.0; quadratic = 0.0;'
                            );
                            constant = 1.0;
                            linear = 0.0;
                            quadratic = 0.0;
                        }

                        aux = [constant, linear, quadratic];
                    } else {
                        aux = [1, 0, 0];
                        this.onXMLMinorError(
                            'light ' + attributeNames[j] + ' undefined for ID = ' + lightId + '\nassuming ' + aux
                        );
                    }
                } else {
                    if (attributeIndex != -1) {
                        aux = this.parseColor(
                            grandChildren[attributeIndex],
                            attributeNames[j] + ' illumination for ID' + lightId
                        );
                    } else {
                        aux = [1, 1, 1, 1];
                        this.onXMLMinorError(
                            'light ' + attributeNames[j] + ' undefined for ID = ' + lightId + '\nassuming ' + aux
                        );
                    }
                }

                if (!Array.isArray(aux)) return aux;

                global.push(aux);
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == 'spot') {
                let angle = this.reader.getFloat(children[i], 'angle', false);
                if (!(angle != null && !isNaN(angle))) {
                    angle = 45;
                    this.onXMLMinorError(
                        'unable to parse angle of the light for ID = ' + lightId + '\nassuming angle = ' + angle
                    );
                }

                let exponent = this.reader.getFloat(children[i], 'exponent', false);
                if (!(exponent != null && !isNaN(exponent))) {
                    exponent = 1;
                    this.onXMLMinorError(
                        'unable to parse exponent of the light for ID = ' + lightId +
                        '\nassuming exponent = ' + exponent
                    );
                }

                const targetIndex = nodeNames.indexOf('target');

                // Retrieves the light target.
                let targetLight = [];
                if (targetIndex != -1) {
                    const aux = this.parseCoordinates3D(
                        grandChildren[targetIndex],
                        'target light for ID ' + lightId
                    );
                    if (!Array.isArray(aux)) return aux;

                    targetLight = aux;
                } else {
                    targetLight = [0, 0, 0];
                    this.onXMLMinorError(
                        'light target undefined for ID = ' + lightId + '\nassuming target = ' + targetLight
                    );
                }

                global.push(...[angle, exponent, targetLight]);
            }


            numLights++;
            if (numLights > 7) {
                this.onXMLError(
                    'too many lights defined; WebGL imposes a limit of 8 lights and one is reserved for the game. Only the first 7 used'
                );
                break;
            }
            this.lights[lightId] = global;
        }

        if (numLights == 0) {
            this.onXMLError('at least one light must be defined');
        }

        this.log('Parsed lights');
        return null;
    }

    /**
     * Parses the <textures> block.
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        const children = texturesNode.children;

        this.textures = [];

        // Any number of materials.
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName != 'texture') {
                this.onXMLMinorError(
                    'unknown tag <' + children[i].nodeName + '>'
                );
                continue;
            }

            // Get id of the current material.
            const textureID = this.reader.getString(children[i], 'id', false);
            if (textureID == null) {
                this.onXMLMinorError('no ID defined for texture');
                continue;
            }

            // Checks for repeated IDs.
            if (this.textures[textureID] != null) {
                this.onXMLMinorError(
                    'ID must be unique for each texture (conflict: ID = ' + textureID + ')'
                );
                continue;
            }

            const filename = this.reader.getString(children[i], 'file', false);
            if (filename == null) {
                this.onXMLMinorError(
                    'unable to parse file of the texture for ID = ' + textureID
                );
                continue;
            }

            this.textures[textureID] = new CGFtexture(this.scene, filename);
        }

        this.log('Parsed textures');
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        const children = materialsNode.children;

        this.materials = [];

        // Any number of materials.
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName != 'material') {
                this.onXMLMinorError(
                    'unknown tag <' + children[i].nodeName + '>'
                );
                continue;
            }

            // Get id of the current material.
            const materialID = this.reader.getString(children[i], 'id', false);
            if (materialID == null) {
                this.onXMLMinorError('no ID defined for material');
                continue;
            }

            // Checks for repeated IDs.
            if (this.materials[materialID] != null) {
                this.onXMLMinorError(
                    'ID must be unique for each material (conflict: ID = ' + materialID + ')'
                );
                continue;
            }

            let shininess = this.reader.getFloat(children[i], 'shininess', false);
            if (!(shininess != null && !isNaN(shininess))) {
                this.onXMLMinorError(
                    'unable to parse shininess of the material for ID = ' + materialID + '. Defaulting to 1.'
                );
                shininess = 1;
            }

            this.materials[materialID] = {
                shininess: shininess,
                emission: [0.0, 0.0, 0.0, 1.0],
                ambient: [0.0, 0.0, 0.0, 1.0],
                diffuse: [0.0, 0.0, 0.0, 1.0],
                specular: [0.0, 0.0, 0.0, 1.0],
            };

            for (const properties of children[i].children) {
                if (properties.nodeName == 'emission') {
                    const emission = this.parseColor(
                        properties,
                        'emission of material ' + materialID
                    );
                    if (!Array.isArray(emission)) {
                        this.onXMLMinorError(
                            'unable to parse emission of the material for ID = ' + materialID + '. Defaulting to black.'
                        );
                        continue;
                    }
                    this.materials[materialID].emission = emission;
                } else if (properties.nodeName == 'ambient') {
                    const ambient = this.parseColor(properties, 'ambient of material ' + materialID);
                    if (!Array.isArray(ambient)) {
                        this.onXMLMinorError(
                            'unable to parse ambient of the material for ID = ' + materialID + '. Defaulting to black.'
                        );
                        continue;
                    }
                    this.materials[materialID].ambient = ambient;
                } else if (properties.nodeName == 'diffuse') {
                    const diffuse = this.parseColor(properties, 'diffuse of material ' + materialID);
                    if (!Array.isArray(diffuse)) {
                        this.onXMLMinorError(
                            'unable to parse diffuse of the material for ID = ' + materialID + '. Defaulting to black.'
                        );
                        continue;
                    }
                    this.materials[materialID].diffuse = diffuse;
                } else if (properties.nodeName == 'specular') {
                    const specular = this.parseColor(properties, 'specular of material ' + materialID);
                    if (!Array.isArray(specular)) {
                        this.onXMLMinorError(
                            'unable to parse specular of the material for ID = ' + materialID + '. Defaulting to black.'
                        );
                        continue;
                    }
                    this.materials[materialID].specular = specular;
                } else {
                    this.onXMLMinorError(
                        'unknown tag <' + properties.nodeName + '>'
                    );
                }
            }
        }

        this.log('Parsed materials');
        return null;
    }

    parseRotation(transformationNode, transformationID) {
        const axis = this.reader.getString(transformationNode, 'axis', false);
        let axisVector;
        if (axis == 'x') {
            axisVector = [1, 0, 0];
        } else if (axis == 'y') {
            axisVector = [0, 1, 0];
        } else if (axis == 'z') {
            axisVector = [0, 0, 1];
        } else {
            this.onXMLMinorError(
                'Invalid axis \'' + axis + '\' for rotate transformation for ID ' + transformationID
            );
            return null;
        }

        const angle = this.reader.getFloat(transformationNode, 'angle', false);
        if (!(angle != null && !isNaN(angle))) {
            this.onXMLMinorError(
                'unable to parse angle of the rotation for ID = ' + transformationID
            );
            return null;
        }

        return {angle: angle, axisVector: axisVector, axis: axis};
    }

    /**
     * Parses a single translation/rotation/scaling block.
     * @param transformationID the ID of the transformation, for debugging messages.
     * @param transformationNode the node containing the transformation block.
     * @param transfMatrix the matrix this transformation will be applied to.
     * @returns
     */
    parseSingleTransformation(
        transformationID,
        transformationNode,
        transfMatrix
    ) {
        let coordinates;
        switch (transformationNode.nodeName) {
        case 'translate':
            coordinates = this.parseCoordinates3D(
                transformationNode,
                'translate transformation for ID ' + transformationID
            );
            if (!Array.isArray(coordinates)) {
                this.onXMLMinorError(
                    'unable to parse translation for ID ' + transformationID
                );
                return null;
            }

            mat4.translate(transfMatrix, transfMatrix, coordinates);
            break;
        case 'scale':
            coordinates = this.parseCoordinates3D(
                transformationNode,
                'scale transformation for ID ' + transformationID
            );
            if (!Array.isArray(coordinates)) {
                this.onXMLMinorError(
                    'unable to parse scaling for ID ' + transformationID
                );
                return null;
            }

            mat4.scale(transfMatrix, transfMatrix, coordinates);
            break;
        case 'rotate':
            const angleAndAxis = this.parseRotation(transformationNode, transformationID);
            if (angleAndAxis == null) {
                return null;
            }

            mat4.rotate(
                transfMatrix,
                transfMatrix,
                degreeToRad(angleAndAxis.angle),
                angleAndAxis.axisVector
            );
            break;
        default:
            this.onXMLMinorError(
                'Unexpected transformation \'' + transformationNode + '\' for ID ' + transformationID
            );
        }
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        const children = transformationsNode.children;

        this.transformations = [];

        let grandChildren = [];

        // Any number of transformations.
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName != 'transformation') {
                this.onXMLMinorError(
                    'unknown tag <' + children[i].nodeName + '>'
                );
                continue;
            }

            // Get id of the current transformation.
            const transformationID = this.reader.getString(children[i], 'id', false);
            if (transformationID == null) {
                this.onXMLMinorError('no ID defined for transformation');
                continue;
            }

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null) {
                this.onXMLMinorError(
                    'ID must be unique for each transformation (conflict: ID = ' + transformationID + ')'
                );
                continue;
            }

            grandChildren = children[i].children;
            // Specifications for the current transformation.

            // Creates a 4x4 identity matrix to which transformations will be applied
            const transfMatrix = mat4.create();

            for (let j = 0; j < grandChildren.length; j++) {
                const error = this.parseSingleTransformation(
                    transformationID,
                    grandChildren[j],
                    transfMatrix
                );
                if (error != null) {
                    this.onXMLMinorError(error);
                    break;
                }
            }
            this.transformations[transformationID] = transfMatrix;
        }

        this.log('Parsed transformations');
        return null;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        const children = primitivesNode.children;

        this.primitives = [];

        let grandChildren = [];

        // Any number of primitives.
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName != 'primitive') {
                this.onXMLMinorError(
                    'unknown tag <' + children[i].nodeName + '>'
                );
                continue;
            }

            // Get id of the current primitive.
            const primitiveId = this.reader.getString(children[i], 'id', false);
            if (primitiveId == null) {
                this.onXMLMinorError('no ID defined for primitive');
                continue;
            }

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null) {
                this.onXMLMinorError(
                    'ID must be unique for each primitive (conflict: ID = ' + primitiveId + ')'
                );
                continue;
            }

            grandChildren = children[i].children;

            // Validate the primitive type
            if (
                grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' &&
                    grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' &&
                    grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus' &&
                    grandChildren[0].nodeName != 'patch')
            ) {
                this.onXMLMinorError(
                    'There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere, torus, patch)'
                );
                continue;
            }

            // Specifications for the current primitive.
            const primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {
                // <rectangle x1="ff" y1="ff" x2="ff" y2="ff" />

                // x1
                const x1 = this.reader.getFloat(grandChildren[0], 'x1', false);
                if (!(x1 != null && !isNaN(x1))) {
                    this.onXMLMinorError(
                        'unable to parse x1 of the primitive coordinates for ID = ' + primitiveId
                    );
                    continue;
                }

                // y1
                const y1 = this.reader.getFloat(grandChildren[0], 'y1', false);
                if (!(y1 != null && !isNaN(y1))) {
                    this.onXMLMinorError(
                        'unable to parse y1 of the primitive coordinates for ID = ' + primitiveId
                    );
                    continue;
                }

                // x2
                const x2 = this.reader.getFloat(grandChildren[0], 'x2', false);
                if (!(x2 != null && !isNaN(x2) && x2 > x1)) {
                    this.onXMLMinorError(
                        'unable to parse x2 of the primitive coordinates for ID = ' + primitiveId
                    );
                    continue;
                }

                // y2
                const y2 = this.reader.getFloat(grandChildren[0], 'y2', false);
                if (!(y2 != null && !isNaN(y2) && y2 > y1)) {
                    this.onXMLMinorError(
                        'unable to parse y2 of the primitive coordinates for ID = ' + primitiveId
                    );
                    continue;
                }

                const rect = new MyRectangle(this.scene, x1, x2, y1, y2);

                this.primitives[primitiveId] = rect;
            } else if (primitiveType == 'triangle') {
                // <triangle x1="ff" y1="ff" z1="ff"
                //           x2="ff" y2="ff" z2="ff"
                //           x3="ff" y3="ff" z3="ff" />

                // x1
                const x1 = this.reader.getFloat(grandChildren[0], 'x1', false);
                if (!(x1 != null && !isNaN(x1))) {
                    this.onXMLMinorError(
                        'unable to parse x1 of the primitive coordinates for ID = ' + primitiveId
                    );
                    continue;
                }

                // y1
                const y1 = this.reader.getFloat(grandChildren[0], 'y1', false);
                if (!(y1 != null && !isNaN(y1))) {
                    this.onXMLMinorError(
                        'unable to parse y1 of the primitive coordinates for ID = ' + primitiveId
                    );
                    continue;
                }

                // z1
                const z1 = this.reader.getFloat(grandChildren[0], 'z1', false);
                if (!(z1 != null && !isNaN(z1))) {
                    this.onXMLMinorError(
                        'unable to parse z1 of the primitive coordinates for ID = ' + primitiveId
                    );
                    continue;
                }

                // x2
                const x2 = this.reader.getFloat(grandChildren[0], 'x2', false);
                if (!(x2 != null && !isNaN(x2))) {
                    this.onXMLMinorError(
                        'unable to parse x2 of the primitive coordinates for ID = ' + primitiveId
                    );
                    continue;
                }

                // y2
                const y2 = this.reader.getFloat(grandChildren[0], 'y2', false);
                if (!(y2 != null && !isNaN(y2))) {
                    this.onXMLMinorError(
                        'unable to parse y2 of the primitive coordinates for ID = ' + primitiveId
                    );
                    continue;
                }

                // z2
                const z2 = this.reader.getFloat(grandChildren[0], 'z2', false);
                if (!(z2 != null && !isNaN(z2))) {
                    this.onXMLMinorError(
                        'unable to parse z2 of the primitive coordinates for ID = ' + primitiveId
                    );
                    continue;
                }

                // x3
                const x3 = this.reader.getFloat(grandChildren[0], 'x3', false);
                if (!(x3 != null && !isNaN(x3))) {
                    this.onXMLMinorError(
                        'unable to parse x3 of the primitive coordinates for ID = ' + primitiveId
                    );
                    continue;
                }

                // y3
                const y3 = this.reader.getFloat(grandChildren[0], 'y3', false);
                if (!(y3 != null && !isNaN(y3))) {
                    this.onXMLMinorError(
                        'unable to parse y3 of the primitive coordinates for ID = ' + primitiveId
                    );
                    continue;
                }

                // z3
                const z3 = this.reader.getFloat(grandChildren[0], 'z3', false);
                if (!(z3 != null && !isNaN(z3))) {
                    this.onXMLMinorError(
                        'unable to parse z3 of the primitive coordinates for ID = ' + primitiveId
                    );
                    continue;
                }

                const triangle = new MyTriangle(
                    this.scene,
                    [x1, y1, z1],
                    [x2, y2, z2],
                    [x3, y3, z3]
                );

                this.primitives[primitiveId] = triangle;
            } else if (primitiveType == 'cylinder') {
                // <cylinder base="ff" top="ff" height="ff" slices="ii" stacks="ii" />

                // base
                const base = this.reader.getFloat(grandChildren[0], 'base', false);
                if (!(base != null && !isNaN(base))) {
                    this.onXMLMinorError(
                        'unable to parse base of the primitive for ID = ' + primitiveId
                    );
                    continue;
                }

                // top
                const top = this.reader.getFloat(grandChildren[0], 'top', false);
                if (!(top != null && !isNaN(top))) {
                    this.onXMLMinorError(
                        'unable to parse top of the primitive for ID = ' + primitiveId
                    );
                    continue;
                }

                // height
                const height = this.reader.getFloat(grandChildren[0], 'height', false);
                if (!(height != null && !isNaN(height))) {
                    this.onXMLMinorError(
                        'unable to parse height of the primitive for ID = ' + primitiveId
                    );
                    continue;
                }

                // slices
                const slices = this.reader.getInteger(grandChildren[0], 'slices', false);
                if (!(slices != null && !isNaN(slices))) {
                    this.onXMLMinorError(
                        'unable to parse slices of the primitive for ID = ' + primitiveId
                    );
                    continue;
                }

                // stacks
                const stacks = this.reader.getInteger(grandChildren[0], 'stacks', false);
                if (!(stacks != null && !isNaN(stacks))) {
                    this.onXMLMinorError(
                        'unable to parse stacks of the primitive for ID = ' + primitiveId
                    );
                    continue;
                }

                const cylinder = new MyCylinder(
                    this.scene,
                    base,
                    top,
                    height,
                    slices,
                    stacks
                );

                this.primitives[primitiveId] = cylinder;
            } else if (primitiveType == 'sphere') {
                // <sphere radius="ff" slices="ii" stacks="ii" />

                // radius
                const radius = this.reader.getFloat(grandChildren[0], 'radius', false);
                if (!(radius != null && !isNaN(radius))) {
                    this.onXMLMinorError(
                        'unable to parse radius of the primitive for ID = ' + primitiveId
                    );
                    continue;
                }

                // slices
                const slices = this.reader.getInteger(grandChildren[0], 'slices', false);
                if (!(slices != null && !isNaN(slices))) {
                    this.onXMLMinorError(
                        'unable to parse slices of the primitive for ID = ' + primitiveId
                    );
                    continue;
                }

                // stacks
                const stacks = this.reader.getInteger(grandChildren[0], 'stacks', false);
                if (!(stacks != null && !isNaN(stacks))) {
                    this.onXMLMinorError(
                        'unable to parse stacks of the primitive for ID = ' + primitiveId
                    );
                    continue;
                }

                const sphere = new MySphere(this.scene, radius, slices, stacks);

                this.primitives[primitiveId] = sphere;
            } else if (primitiveType == 'torus') {
                // <torus inner="ff" outer="ff" slices="ii" loops="ii" />

                // inner
                const inner = this.reader.getFloat(grandChildren[0], 'inner', false);
                if (!(inner != null && !isNaN(inner))) {
                    this.onXMLMinorError(
                        'unable to parse inner of the primitive for ID = ' + primitiveId
                    );
                    continue;
                }

                // outer
                const outer = this.reader.getFloat(grandChildren[0], 'outer', false);
                if (!(outer != null && !isNaN(outer))) {
                    this.onXMLMinorError(
                        'unable to parse outer of the primitive for ID = ' + primitiveId
                    );
                    continue;
                }

                // slices
                const slices = this.reader.getInteger(grandChildren[0], 'slices', false);
                if (!(slices != null && !isNaN(slices))) {
                    this.onXMLMinorError(
                        'unable to parse slices of the primitive for ID = ' + primitiveId
                    );
                    continue;
                }

                // loops
                const loops = this.reader.getInteger(grandChildren[0], 'loops', false);
                if (!(loops != null && !isNaN(loops))) {
                    this.onXMLMinorError(
                        'unable to parse loops of the primitive for ID = ' + primitiveId
                    );
                    continue;
                }

                const torus = new MyTorus(
                    this.scene,
                    inner,
                    outer,
                    slices,
                    loops
                );

                this.primitives[primitiveId] = torus;
            } else if (primitiveType == 'patch') {
                // <patch degree_u="ii" parts_u="ii" degree_v="ii" parts_v="ii" >
                //     <controlpoint x="ff" y="ff" z="ff" />
                //     ...
                // </patch>

                // degree_u
                const degree_u = this.reader.getInteger(grandChildren[0], 'degree_u', false);
                if (!(degree_u != null && !isNaN(degree_u))) {
                    this.onXMLMinorError(
                        'unable to parse degree_u of the primitive for ID = ' + primitiveId
                    );
                    continue;
                }

                // parts_u
                const parts_u = this.reader.getInteger(grandChildren[0], 'parts_u', false);
                if (!(parts_u != null && !isNaN(parts_u))) {
                    this.onXMLMinorError(
                        'unable to parse parts_u of the primitive for ID = ' + primitiveId
                    );
                    continue;
                }

                // degree_v
                const degree_v = this.reader.getInteger(grandChildren[0], 'degree_v', false);
                if (!(degree_v != null && !isNaN(degree_v))) {
                    this.onXMLMinorError(
                        'unable to parse degree_v of the primitive for ID = ' + primitiveId
                    );
                    continue;
                }

                // parts_v
                const parts_v = this.reader.getInteger(grandChildren[0], 'parts_v', false);
                if (!(parts_v != null && !isNaN(parts_v))) {
                    this.onXMLMinorError(
                        'unable to parse parts_v of the primitive for ID = ' + primitiveId
                    );
                    continue;
                }

                // control points
                const controlPoints = [];

                const controlPointsNodes = grandChildren[0].children;

                for (let i = 0; i < degree_u + 1; i++) {
                    const controlPointsRow = []
                    for (let j = 0; j < degree_v + 1; j++) {
                        const controlPoint = this.parseCoordinates3D(controlPointsNodes[i*(degree_v+1)+j], "controlpoint " + j + " for ID = " + primitiveId);
                        controlPoint.push(1);
                        controlPointsRow.push(controlPoint);
                    }
                    controlPoints.push(controlPointsRow);
                }

                const patch = new MyPatch(
                    this.scene,
                    degree_u,
                    parts_u,
                    degree_v,
                    parts_v,
                    controlPoints
                );

                this.primitives[primitiveId] = patch;
            } else {
                this.onXMLMinorError('unknown tag <' + primitiveType + '>');
            }
        }

        this.log('Parsed primitives');
        return null;
    }

    /**
     * Parses the <animations> block.
     * @param {animations block element} animationsNode
     */
    parseAnimations(animationsNode) {
        this.animations = [];

        const keyframeAnims = animationsNode.children;
        for (let i = 0; i < keyframeAnims.length; i++) {
            if (keyframeAnims[i].nodeName != 'keyframeanim') {
                this.onXMLMinorError(
                    'unknown tag <' + children[i].nodeName + '>'
                );
                continue;
            }
            
            let error;
            if ((error = this.parseAnimation(keyframeAnims[i])) != null) {
                return error;
            }
        }

        this.log('Parsed animations');
        return null;
    }

    /**
     * Parses a <keyframeanim> block.
     * @param {keyframeanim block element} keyframeanimNode
     */
    parseAnimation(keyframeanimNode) {
        // Get id of the current animation.
        const animationID = this.reader.getString(keyframeanimNode, 'id', false);
        if (animationID == null) {
            this.onXMLMinorError('no ID defined for animation');
            return null;
        }

        // Checks for repeated IDs.
        if (this.animations[animationID] != null) {
            this.onXMLMinorError(
                'ID must be unique for each animation (conflict: ID = ' + animationID + ')'
            );
            return null;
        }

        const animation = new MyKeyframeAnimation(this.scene, animationID);

        const keyframesNodes = keyframeanimNode.children;
        let last_inst = -1;
        for (let i = 0; i < keyframesNodes.length; i++) {
            // Get instant of the current keyframe.
            let keyframeInstant = this.reader.getFloat(keyframesNodes[i], 'instant', false);
            if (keyframeInstant == null) {
                this.onXMLMinorError('no instant defined for keyframe');
                continue;
            }

            // convert seconds to milliseconds
            keyframeInstant *= SECONDS_TO_MILLISECONDS;

            // if instant order is not increasing
            if (keyframeInstant <= last_inst) {
                this.onXMLMinorError('instant order of keyframes is not increasing');
                continue;
            }

            last_inst = keyframeInstant;
            const keyFrameTransformations = keyframesNodes[i].children;

            if (keyFrameTransformations.length != 5) {
                this.onXMLMinorError('keyframe must have 5 transformations: translation, rotation-z, rotation-y, rotation-x, scaling');
                return null;
            }

            // translation
            const translation = this.parseCoordinates3D(keyFrameTransformations[0], 'translation for animation ' + animationID);
            if (!Array.isArray(translation) || keyFrameTransformations[0].nodeName != 'translation') {
                this.onXMLMinorError(
                    'unable to parse translation for animation ' + animationID
                );
                return null;
            }
            const transfTranslation = new MyTransformation(Transformations.Translation, translation);

            // rotation z
            const angleAndAxisZ = this.parseRotation(keyFrameTransformations[1], 'rotation for animation ' + animationID);
            if (angleAndAxisZ == null || keyFrameTransformations[1].nodeName != 'rotation') {
                this.onXMLMinorError('unable to parse rotation for animation ' + animationID);
                return null;
            }
            if (angleAndAxisZ.axis != 'z') {
                this.onXMLMinorError('rotation for animation ' + animationID + ' must be around z axis');
                return null;
            }
            const transfRotationZ = new MyTransformation(Transformations.RotationZ, [angleAndAxisZ.angle]);

            // rotation y
            const angleAndAxisY = this.parseRotation(keyFrameTransformations[2], 'rotation for animation ' + animationID);
            if (angleAndAxisY == null || keyFrameTransformations[2].nodeName != 'rotation') {
                this.onXMLMinorError('unable to parse rotation for animation ' + animationID);
                return null;
            }
            if (angleAndAxisY.axis != 'y') {
                this.onXMLMinorError('rotation for animation ' + animationID + ' must be around y axis');
                return null;
            }
            const transfRotationY = new MyTransformation(Transformations.RotationY, [angleAndAxisY.angle]);

            // rotation x
            const angleAndAxisX = this.parseRotation(keyFrameTransformations[3], 'rotation for animation ' + animationID);
            if (angleAndAxisX == null || keyFrameTransformations[3].nodeName != 'rotation') {
                this.onXMLMinorError('unable to parse rotation for animation ' + animationID);
                return null;
            }
            if (angleAndAxisX.axis != 'x') {
                this.onXMLMinorError('rotation for animation ' + animationID + ' must be around x axis');
                return null;
            }
            const transfRotationX = new MyTransformation(Transformations.RotationX, [angleAndAxisX.angle]);

            // scaling
            const scaling = this.parseCoordinates3D(keyFrameTransformations[4], 'scaling for animation ' + animationID);
            if (!Array.isArray(scaling) || keyFrameTransformations[4].nodeName != 'scale') {
                this.onXMLMinorError(
                    'unable to parse scaling for animation ' + animationID
                );
                return null;
            }
            const transfScaling = new MyTransformation(Transformations.Scaling, scaling);

            const keyframe = new MyKeyframe(keyframeInstant, transfTranslation, transfRotationZ, transfRotationY, transfRotationX, transfScaling);

            animation.addKeyframe(keyframe);
        }

        if (animation.getKeyFrames().length > 0) {
            this.animations[animationID] = animation;
        } else {
            this.onXMLMinorError('animation ' + animationID + ' has no valid keyframes');
        }
        // otherwise not, since its mandatory to have 1

        return null;
    }

    /**
     * Parses the <components> block.
     * @param {components block element} componentsNode
     */
    parseComponents(componentsNode) {
        const children = componentsNode.children;

        this.components = [];
        this.componentsIds = [];

        let grandChildren = [];
        let nodeNames = [];

        // First get all components before parsing them, to handle any order
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName != 'component') {
                this.onXMLMinorError(
                    'unknown tag <' + children[i].nodeName + '>'
                );
                continue;
            }

            // Get id of the current component.
            const componentID = this.reader.getString(children[i], 'id', false);
            if (componentID == null) {
                this.onXMLMinorError('no ID defined for component');
                continue;
            }

            // Checks for repeated IDs.
            if (this.components[componentID] != null) {
                this.onXMLMinorError(
                    'ID must be unique for each component (conflict: ID = ' + componentID + ')'
                );
                continue;
            }

            this.components[componentID] = new MyComponent(this.scene, componentID);
            this.componentsIds.push(componentID);
        }

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName != 'component') {
                continue;
            }

            const componentID = this.reader.getString(children[i], 'id', false);

            grandChildren = children[i].children;
            nodeNames = [];
            for (let j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            const transformationIndex = nodeNames.indexOf('transformation');
            const materialsIndex = nodeNames.indexOf('materials');
            const textureIndex = nodeNames.indexOf('texture');
            const childrenIndex = nodeNames.indexOf('children');
            const highlightedIndex = nodeNames.indexOf('highlighted');
            const animationIndex = nodeNames.indexOf('animation');

            // Transformations
            if (grandChildren[transformationIndex] == null) {
                this.onXMLMinorError(
                    'no transformation node defined for component with ID = ' + componentID
                );
            } else if (grandChildren[transformationIndex].children.length > 0) {
                // if there are transformations
                const firstTransformation =
                    grandChildren[transformationIndex].children[0];
                if (firstTransformation.nodeName == 'transformationref') {
                    // transformationref detected; should be the only transformation
                    let transformationID = this.reader.getString(firstTransformation, 'id', false);
                    if (transformationID == null) {
                        this.onXMLMinorError(
                            'no ID defined for transformation in ' + componentID
                        );
                    }
                    if (this.transformations[transformationID] == null) {
                        this.onXMLMinorError(
                            'no transformation with ID ' + transformationID + ' defined'
                        );
                        transformationID = null;
                    }

                    if (transformationID != null) {
                        this.components[componentID].setTransformation(
                            this.transformations[transformationID]
                        );
                    }

                    // check if there are more transformations
                    if (grandChildren[transformationIndex].children.length > 1) {
                        this.onXMLMinorError(
                            'transformationref must be the only transformation, ignoring others in ' + componentID
                        );
                    }
                } else {
                    // multiple transformations can be applied, as long as none are transformationref
                    const currentTransformation = mat4.create();
                    for (const child of grandChildren[transformationIndex]
                        .children) {
                        const error = this.parseSingleTransformation(
                            componentID,
                            child,
                            currentTransformation
                        );
                        if (error != null) {
                            this.onXMLMinorError(error);
                            break;
                        }
                    }
                    this.components[componentID].setTransformation(
                        currentTransformation
                    );
                }
            }

            // Materials
            if (grandChildren[materialsIndex] == null) {
                this.onXMLMinorError(
                    'no materials node defined for component with ID = ' + componentID
                );
                // fallback to a default material
                this.components[componentID].addMaterial(this.scene.fallbackMaterial);
            } else {
                for (const child of grandChildren[materialsIndex].children) {
                    if (child.nodeName != 'material') {
                        this.onXMLMinorError(
                            'Unexpected tag <' + child.nodeName + '>'
                        );
                        continue;
                    }

                    const materialID = this.reader.getString(child, 'id', false);
                    if (materialID == null) {
                        this.onXMLMinorError('no ID defined for materialID in ' + componentID);
                        continue;
                    }

                    if (materialID == 'inherit') {
                        this.components[componentID].inheritMaterial();
                    } else {
                        if (this.materials[materialID] == null) {
                            this.onXMLMinorError(
                                'no material with ID ' + materialID + ' defined'
                            );
                            continue;
                        }
                        this.components[componentID].addMaterial(
                            this.materials[materialID]
                        );
                    }
                }

                if (this.components[componentID].materials.length == 0) {
                    this.onXMLMinorError('no materials defined for ' + componentID);
                    // fallback to a default material
                    this.components[componentID].addMaterial(this.scene.fallbackMaterial);
                }
            }

            // Texture
            if (grandChildren[textureIndex] == null) {
                this.onXMLMinorError(
                    'no texture node defined for component with ID = ' + componentID
                );
            } else {
                const textureID = this.reader.getString(grandChildren[textureIndex], 'id', false);
                if (textureID == null) {
                    this.onXMLMinorError('no ID defined for textureID in ' + componentID);
                } else {
                    let lengthS = this.reader.getFloat(grandChildren[textureIndex], 'length_s', false);
                    let lengthT = this.reader.getFloat(grandChildren[textureIndex], 'length_t', false);

                    if (textureID == 'inherit') {
                        if (lengthS != null || lengthT != null) {
                            this.onXMLMinorError(
                                'length_s and length_t should not be defined for textureID inherit in ' + componentID
                            );
                        }
                        this.components[componentID].inheritTexture();
                    } else if (textureID == 'none') {
                        if (lengthS != null || lengthT != null) {
                            this.onXMLMinorError(
                                'length_s and length_t should not be defined for textureID none in ' + componentID
                            );
                        }
                    } else {
                        // textureID is a texture, so length_s and length_t are mandatory
                        if (lengthS == null) {
                            this.onXMLMinorError('no length_s defined for textureID in ' + componentID + '. Assuming 1.0');
                            lengthS = 1.0;
                        }
                        if (lengthT == null) {
                            this.onXMLMinorError('no length_t defined for textureID in ' + componentID + '. Assuming 1.0');
                            lengthT = 1.0;
                        }

                        if (this.textures[textureID] == null) {
                            this.onXMLMinorError('no texture with ID ' + textureID + ' defined');
                        } else {
                            this.components[componentID].setTexture(
                                this.textures[textureID],
                                lengthS,
                                lengthT
                            );
                        }
                    }
                }
            }

            // Children
            if (grandChildren[childrenIndex] == null) {
                this.onXMLMinorError(
                    'no children node defined for component with ID = ' + componentID
                );
            } else {
                for (const child of grandChildren[childrenIndex].children) {
                    if (child.nodeName == 'componentref') {
                        // Add a new component to the component
                        const componentref = this.reader.getString(child, 'id', false);

                        if (this.components[componentref] == null) {
                            this.onXMLError(
                                'componentref ' + componentref + ' does not exist'
                            );
                            continue;
                        }

                        this.components[componentID].addComponentChild(
                            this.components[componentref]
                        );
                    } else if (child.nodeName == 'primitiveref') {
                        // Add a new primitive to the component
                        const primitiveref = this.reader.getString(child, 'id', false);

                        if (this.primitives[primitiveref] == null) {
                            this.onXMLError(
                                'primitiveref ' + primitiveref + ' does not exist'
                            );
                            continue;
                        }

                        this.components[componentID].addPrimitiveChild(
                            this.primitives[primitiveref]
                        );
                    } else {
                        this.onXMLMinorError(
                            'Unexpected tag <' + child.nodeName + '>'
                        );
                    }
                }

                if (!this.components[componentID].hasChildren()) {
                    this.onXMLMinorError('no children defined for ' + componentID);
                }
            }

            // Highlighted
            // opcional
            if (grandChildren[highlightedIndex] != null) {
                // <highlighted r="ff" g="ff" b="ff" scale_h="ff" />
                let highlightedError = false;
                const color = this.parseColor(grandChildren[highlightedIndex], 'highlighted color for component ' + componentID, false);
                if (!Array.isArray(color)) {
                    highlightedError = true;
                    this.onXMLError('unable to parse highlighted color ' + color + " for component " + componentID);
                }
                
                const scale_h = this.reader.getFloat(grandChildren[highlightedIndex], 'scale_h', false);
                if (scale_h == null) {
                    highlightedError = true;
                    this.onXMLError('unable to parse highlighted scale_h ' + scale_h + " for component " + componentID);
                }

                if (!highlightedError) {
                    this.components[componentID].setHighlighting(color, scale_h);
                }
            }
            // Animation
            // optional
            if (grandChildren[animationIndex] != null) {
                const animationID = this.reader.getString(grandChildren[animationIndex], 'id', true);
                if (animationID == null) {
                    this.onXMLMinorError('no ID defined for animationID in ' + componentID);
                } else {
                    if (this.animations[animationID] == null) {
                        this.onXMLMinorError('no animation with ID ' + animationID + ' defined');
                    } else {
                        this.components[componentID].setAnimation(this.animations[animationID]);
                    }
                }
            }
        }

        // Check if there are cyclic references
        if (this.idRoot != null && this.componentsIds.length > 0 && this.hasCycle()) {
            return 'Scene graph has a cycle.';
        }
    }

    /**
     * Checks if this scene graph has a cycle
     */
    hasCycle() {
        // Initialization
        const visited = {};
        const recStack = {};
        for (const componentId in this.components) {
            visited[componentId] = false;
            recStack[componentId] = false;
        }

        // Run algorithm
        if (this.dfsCycleDetection(this.idRoot, visited, recStack)) {
            return true;
        }

        return false;
    }

    /**
     * Recursively checks for cycles based on a dfs
     * @param {string} id - id of the node to process
     * @param {Object} visited - which nodes have been visited
     * @param {Object} recStack - which nodes are currently "on the stack"
     */
    dfsCycleDetection(id, visited, recStack) {
        if (recStack[id]) return true;
        if (visited[id]) return false;

        visited[id] = true;
        recStack[id] = true;

        for (const adjComponent of this.components[id].getComponentChildren()) {
            if (this.dfsCycleDetection(adjComponent.getId(), visited, recStack)) {
                return true;
            }
        }

        recStack[id] = false;
        return false;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        const position = [];

        // x
        let x = this.reader.getFloat(node, 'x', false);
        if (!(x != null && !isNaN(x))) {
            x = 0;
            this.onXMLError(
                'unable to parse x-coordinate of the ' + messageError
            );
        }

        // y
        let y = this.reader.getFloat(node, 'y', false);
        if (!(y != null && !isNaN(y))) {
            y = 0;
            this.onXMLError(
                'unable to parse y-coordinate of the ' + messageError
            );
        }

        // z
        let z = this.reader.getFloat(node, 'z', false);
        if (!(z != null && !isNaN(z))) {
            z = 0;
            this.onXMLError(
                'unable to parse z-coordinate of the ' + messageError
            );
        }

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        let position = [];

        // Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position)) return position;

        // w
        let w = this.reader.getFloat(node, 'w', false);
        if (!(w != null && !isNaN(w))) {
            w = 0;
            this.onXMLError(
                'unable to parse w-coordinate of the ' + messageError
            );
        }

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError, parseAlpha=true) {
        const color = [];

        // R
        let r = this.reader.getFloat(node, 'r', false);
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1)) {
            this.onXMLError(
                'unable to parse R component of the ' + messageError
            );
            r = 0;
        }

        // G
        let g = this.reader.getFloat(node, 'g', false);
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1)) {
            g = 0;
            this.onXMLError(
                'unable to parse G component of the ' + messageError
            );
        }

        // B
        let b = this.reader.getFloat(node, 'b', false);
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1)) {
            b = 0;
            this.onXMLError(
                'unable to parse B component of the ' + messageError
            );
        }

        // A
        if (parseAlpha) {
            let a = this.reader.getFloat(node, 'a', false);
            if (!(a != null && !isNaN(a) && a >= 0 && a <= 1)) {
                a = 0;
                this.onXMLError(
                    'unable to parse A component of the ' + messageError
                );
            }

            color.push(...[r, g, b, a]);
        } else {
            color.push(...[r, g, b, 1.0]);
        }
        
        return color;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error('XML Loading Error: ' + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn('Warning: ' + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log('   ' + message);
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        if (this.components[this.idRoot] != null) {
            this.components[this.idRoot].display();
        }
    }

    /**
     * Updates the animation matrix for all the components recursively
     * @param {double} t - Current time
     */
    update(t) {
        if (this.components[this.idRoot] != null) {
            this.components[this.idRoot].update(t);
        }
    }
}
