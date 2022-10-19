import { CGFcamera, CGFcameraOrtho, CGFXMLreader } from "../lib/CGF.js";
import { MyCylinder } from "./MyCylinder.js";
import { MyRectangle } from "./MyRectangle.js";
import { MySphere } from "./MySphere.js";
import { MyTorus } from "./MyTorus.js";
import { MyTriangle } from "./MyTriangle.js";
import { MyComponent } from "./MyComponent.js";
import { CGFtexture } from "../lib/CGF.js";

// TODO finish README.md
// TODO cleanup and document and error handling

let DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
let SCENE_INDEX = 0;
let VIEWS_INDEX = 1;
let AMBIENT_INDEX = 2;
let LIGHTS_INDEX = 3;
let TEXTURES_INDEX = 4;
let MATERIALS_INDEX = 5;
let TRANSFORMATIONS_INDEX = 6;
let PRIMITIVES_INDEX = 7;
let COMPONENTS_INDEX = 8;

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
        this.axisCoords["x"] = [1, 0, 0];
        this.axisCoords["y"] = [0, 1, 0];
        this.axisCoords["z"] = [0, 0, 1];

        // File reading
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open("scenes/" + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        let rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the letious blocks
        let error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "sxs") return "root tag <sxs> missing";

        let nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        let nodeNames = [];

        for (let i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        if (nodeNames.indexOf("parsererror") != -1) {
            this.onXMLError(
                "Parser error: " +
                    nodes[nodeNames.indexOf("parsererror")].innerText
            );
        }

        let error;

        // Processes each node, verifying errors.

        // <scene>
        let index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            this.onXMLError("tag <scene> missing");
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null) return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            this.onXMLError("tag <views> missing");
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order " + index);

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null) return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            this.onXMLError("tag <ambient> missing");
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order " + index);

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null) return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            this.onXMLError("tag <lights> missing");
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order " + index);

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null) return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            this.onXMLError("tag <textures> missing");
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order " + index);

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            this.onXMLError("tag <materials> missing");
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order " + index);

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            this.onXMLError("tag <transformations> missing");
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError(
                    "tag <transformations> out of order " + index
                );

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            this.onXMLError("tag <primitives> missing");
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order " + index);

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            this.onXMLError("tag <components> missing");
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order " + index);

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <scene> block.
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {
        // Get root of the scene.
        let root = this.reader.getString(sceneNode, "root");
        if (root == null) this.onXMLError("no root defined for scene");

        this.idRoot = root;

        // Get axis length
        let axis_length = this.reader.getFloat(sceneNode, "axis_length");
        if (axis_length == null) {
            axis_length = 1;
            this.onXMLMinorError(
                "no axis_length defined for scene; assuming 'length = 1'"
            );
        }

        this.referenceLength = axis_length;

        this.log("Parsed scene");

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
        this.scene.selectedView = this.reader.getString(viewsNode, "default");
        if (this.scene.selectedView == null) {
            this.onXMLError("no default view defined for views");
        }

        let children = viewsNode.children;
        for (let i = 0; i < children.length; i++) {
            if (
                children[i].nodeName == "perspective" ||
                children[i].nodeName == "ortho"
            ) {
                // id
                let viewId = this.reader.getString(children[i], "id");
                if (viewId == null) {
                    this.onXMLMinorError("unable to parse id for view");
                    continue;
                }

                // Checks for repeated IDs.
                if (this.cameras[viewId] != null) {
                    this.onXMLMinorError(
                        "ID must be unique for each view (conflict: ID = " +
                            viewId +
                            ")"
                    );
                    continue;
                }

                // near
                let near = this.reader.getFloat(children[i], "near");
                if (!(near != null && !isNaN(near))) {
                    this.onXMLMinorError(
                        "unable to parse near attribute of view with ID = " +
                            viewId
                    );
                    continue;
                }

                // far
                let far = this.reader.getFloat(children[i], "far");
                if (!(far != null && !isNaN(far))) {
                    this.onXMLMinorError(
                        "unable to parse far attribute of view with ID = " +
                            viewId
                    );
                    continue;
                }

                let grandChildren = children[i].children;
                if (grandChildren.length < 2 || grandChildren.length > 3) {
                    this.onXMLMinorError(
                        "unable to parse children nodes of view with ID = " +
                            viewId +
                            ": wrong number of children (" +
                            grandChildren.length +
                            ")"
                    );
                    continue;
                }

                let nodeNames = [];
                for (let j = 0; j < grandChildren.length; j++) {
                    nodeNames.push(grandChildren[j].nodeName);
                }

                // from & to
                let fromToPositions = [];
                for (const grandChildrenName of ["from", "to"]) {
                    let attributeIndex = nodeNames.indexOf(grandChildrenName);

                    if (attributeIndex != -1) {
                        let pos = this.parseCoordinates3D(
                            grandChildren[attributeIndex],
                            "view position for ID" + viewId
                        );

                        if (!Array.isArray(pos)) {
                            this.onXMLMinorError(
                                "unable to parse " +
                                    grandChildrenName +
                                    " coordinates of view with ID = " +
                                    viewId
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
                            "unable to parse " +
                                grandChildrenName +
                                " coordinates of view with ID = " +
                                viewId
                        );
                        fromToPositions = [
                            [1, 1, 1],
                            [0, 0, 0],
                        ];
                        break;
                    }
                }

                if (children[i].nodeName == "perspective") {
                    if (nodeNames.length != 2) {
                        this.onXMLMinorError(
                            "invalid number of children of perspective view with ID = " +
                                viewId
                        );
                        continue;
                    }

                    // angle
                    let angle = this.reader.getFloat(children[i], "angle");
                    if (!(angle != null && !isNaN(angle))) {
                        this.onXMLMinorError(
                            "unable to parse angle attribute of view with ID = " +
                                viewId
                        );
                        continue;
                    }

                    // Add the new perspective camera
                    this.cameras[viewId] = new CGFcamera(
                        angle * DEGREE_TO_RAD, near, far,
                        fromToPositions[0], fromToPositions[1]
                    );
                } else {
                    // == "ortho"
                    if (nodeNames.length < 2 || nodeNames.length > 3) {
                        this.onXMLMinorError(
                            "invalid number of children of view with ID = " +
                                viewId
                        );
                        continue;
                    }

                    // left
                    let left = this.reader.getFloat(children[i], "left");
                    if (!(left != null && !isNaN(left))) {
                        this.onXMLMinorError(
                            "unable to parse left attribute of view with ID = " +
                                viewId
                        );
                        continue;
                    }

                    // right
                    let right = this.reader.getFloat(children[i], "right");
                    if (!(right != null && !isNaN(right))) {
                        this.onXMLMinorError(
                            "unable to parse right attribute of view with ID = " +
                                viewId
                        );
                        continue;
                    }

                    // top
                    let top = this.reader.getFloat(children[i], "top");
                    if (!(top != null && !isNaN(top))) {
                        this.onXMLMinorError(
                            "unable to parse top attribute of view with ID = " +
                                viewId
                        );
                        continue;
                    }

                    // bottom
                    let bottom = this.reader.getFloat(children[i], "bottom");
                    if (!(bottom != null && !isNaN(bottom))) {
                        this.onXMLMinorError(
                            "unable to parse bottom attribute of view with ID = " +
                                viewId
                        );
                        continue;
                    }

                    // up
                    let up = [0, 1, 0]; // default value
                    let upAttributeIndex = nodeNames.indexOf("up");
                    if (upAttributeIndex != -1) {
                        let pos = this.parseCoordinates3D(
                            grandChildren[upAttributeIndex],
                            "view position for ID" + viewId
                        );

                        if (!Array.isArray(pos)) {
                            this.onXMLMinorError(
                                "unable to parse up coordinates of view with ID = " +
                                    viewId
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
                    "unknown tag <" + children[i].nodeName + ">"
                );
                continue;
            }
        }

        let defaultCamera = this.cameras[this.scene.selectedView];
        if (defaultCamera != null) {
            this.scene.setCamera(defaultCamera);
        } else {
            this.onXMLError(
                "default camera with ID = " +
                    this.scene.selectedView +
                    " not found"
            );
        }

        this.log("Parsed views and created cameras.");

        return null;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */

    parseAmbient(ambientsNode) {
        let children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        let nodeNames = [];

        for (let i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        let ambientIndex = nodeNames.indexOf("ambient");
        let backgroundIndex = nodeNames.indexOf("background");

        let color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            this.onXMLError("unable to parse ambient color " + color);
        else this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            this.onXMLError("unable to parse background color " + color);
        else this.background = color;

        this.log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        let children = lightsNode.children;

        this.lights = [];
        let numLights = 0;

        let grandChildren = [];
        let nodeNames = [];

        // Any number of lights.
        for (let i = 0; i < children.length; i++) {
            // Storing light information
            let global = [];
            let attributeNames = [];
            let attributeTypes = [];

            //Check type of light
            if (
                children[i].nodeName != "omni" &&
                children[i].nodeName != "spot"
            ) {
                this.onXMLMinorError(
                    "unknown tag <" + children[i].nodeName + ">"
                );
                continue;
            } else {
                attributeNames.push(
                    ...["location", "ambient", "diffuse", "specular", "attenuation"]
                );
                attributeTypes.push(...["position", "color", "color", "color", "attenuation"]);
            }

            // Get id of the current light.
            let lightId = this.reader.getString(children[i], "id");
            if (lightId == null) return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return (
                    "ID must be unique for each light (conflict: ID = " +
                    lightId +
                    ")"
                );

            // Light enable/disable
            let aux = this.reader.getBoolean(children[i], "enabled");
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError(
                    "unable to parse value component of the 'enable light' field for ID = " +
                        lightId +
                        "; assuming 'value = 0'"
                );
            let enableLight = aux != null && aux;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (let j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (let j = 0; j < attributeNames.length; j++) {
                let attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position") {
                        aux = this.parseCoordinates4D(
                            grandChildren[attributeIndex],
                            "light position for ID" + lightId
                        );
                    } else if (attributeTypes[j] == "attenuation") {
                        let constant = this.reader.getFloat(grandChildren[attributeIndex], "constant");
                        let linear = this.reader.getFloat(grandChildren[attributeIndex], "linear");
                        let quadratic = this.reader.getFloat(grandChildren[attributeIndex], "quadratic");

                        const sortedValues = [constant, linear, quadratic].sort();

                        if (!(constant != null && !isNaN(constant) &&
                            linear != null && !isNaN(linear) &&
                            quadratic != null && !isNaN(quadratic))) {

                            this.onXMLMinorError(
                                "unable to parse 'attenuation' for ID = " +
                                    lightId + "; assuming constant = 1.0; linear = 0.0; quadratic = 0.0;"
                            );
                            constant = 1.0;
                            linear = 0.0;
                            quadratic = 0.0;
                        } else if (!(sortedValues[0] == 0.0 && sortedValues[1] == 0.0 && sortedValues[2] == 1.0)) {
                            this.onXMLMinorError(
                                "invalid values for attenuation (only one is \"1.0\", the others are \"0.0\") for ID = " +
                                    lightId + "; assuming constant = 1.0; linear = 0.0; quadratic = 0.0;"
                            );
                            constant = 1.0;
                            linear = 0.0;
                            quadratic = 0.0;
                        }

                        aux = [constant, linear, quadratic];
                    } else {
                        aux = this.parseColor(
                            grandChildren[attributeIndex],
                            attributeNames[j] + " illumination for ID" + lightId
                        );
                    }

                    if (!Array.isArray(aux)) return aux;

                    global.push(aux);
                } else
                    return (
                        "light " +
                        attributeNames[i] +
                        " undefined for ID = " +
                        lightId
                    );
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                let angle = this.reader.getFloat(children[i], "angle");
                if (!(angle != null && !isNaN(angle)))
                    return (
                        "unable to parse angle of the light for ID = " + lightId
                    );

                let exponent = this.reader.getFloat(children[i], "exponent");
                if (!(exponent != null && !isNaN(exponent)))
                    return (
                        "unable to parse exponent of the light for ID = " +
                        lightId
                    );

                let targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                let targetLight = [];
                if (targetIndex != -1) {
                    let aux = this.parseCoordinates3D(
                        grandChildren[targetIndex],
                        "target light for ID " + lightId
                    );
                    if (!Array.isArray(aux)) return aux;

                    targetLight = aux;
                } else return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight]);
            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0) return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError(
                "too many lights defined; WebGL imposes a limit of 8 lights"
            );

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block.
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        let children = texturesNode.children;

        this.textures = [];

        // Any number of materials.
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName != "texture") {
                this.onXMLMinorError(
                    "unknown tag <" + children[i].nodeName + ">"
                );
                continue;
            }

            // Get id of the current material.
            let textureID = this.reader.getString(children[i], "id");
            if (textureID == null) {
                this.onXMLMinorError("no ID defined for texture");
                continue;
            }

            // Checks for repeated IDs.
            if (this.textures[textureID] != null) {
                this.onXMLMinorError(
                    "ID must be unique for each texture (conflict: ID = " +
                        textureID +
                        ")"
                );
                continue;
            }

            let filename = this.reader.getString(children[i], "file");
            if (filename == null) {
                this.onXMLMinorError(
                    "unable to parse file of the texture for ID = " + textureID
                );
                continue;
            }

            this.textures[textureID] = new CGFtexture(this.scene, filename);
        }

        this.log("Parsed textures");
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        let children = materialsNode.children;

        this.materials = [];

        // Any number of materials.
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName != "material") {
                this.onXMLMinorError(
                    "unknown tag <" + children[i].nodeName + ">"
                );
                continue;
            }

            // Get id of the current material.
            let materialID = this.reader.getString(children[i], "id");
            if (materialID == null) {
                this.onXMLMinorError("no ID defined for material");
                continue;
            }

            // Checks for repeated IDs.
            if (this.materials[materialID] != null) {
                this.onXMLMinorError(
                    "ID must be unique for each material (conflict: ID = " +
                        materialID +
                        ")"
                );
                continue;
            }

            let shininess = this.reader.getFloat(children[i], "shininess");
            if (!(shininess != null && !isNaN(shininess))) {
                this.onXMLMinorError(
                    "unable to parse shininess of the material for ID = " +
                        materialID +
                        ". Defaulting to 1."
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

            for (let properties of children[i].children) {
                if (properties.nodeName == "emission") {
                    let emission = this.parseColor(
                        properties,
                        "emission of material " + materialID
                    );
                    if (!Array.isArray(emission)) {
                        this.onXMLMinorError(
                            "unable to parse emission of the material for ID = " +
                                materialID +
                                ". Defaulting to black."
                        );
                        continue;
                    }
                    this.materials[materialID].emission = emission;
                } else if (properties.nodeName == "ambient") {
                    let ambient = this.parseColor(
                        properties,
                        "ambient of material " + materialID
                    );
                    if (!Array.isArray(ambient)) {
                        this.onXMLMinorError(
                            "unable to parse ambient of the material for ID = " +
                                materialID +
                                ". Defaulting to black."
                        );
                        continue;
                    }
                    this.materials[materialID].ambient = ambient;
                } else if (properties.nodeName == "diffuse") {
                    let diffuse = this.parseColor(
                        properties,
                        "diffuse of material " + materialID
                    );
                    if (!Array.isArray(diffuse)) {
                        this.onXMLMinorError(
                            "unable to parse diffuse of the material for ID = " +
                                materialID +
                                ". Defaulting to black."
                        );
                        continue;
                    }
                    this.materials[materialID].diffuse = diffuse;
                } else if (properties.nodeName == "specular") {
                    let specular = this.parseColor(
                        properties,
                        "specular of material " + materialID
                    );
                    if (!Array.isArray(specular)) {
                        this.onXMLMinorError(
                            "unable to parse specular of the material for ID = " +
                                materialID +
                                ". Defaulting to black."
                        );
                        continue;
                    }
                    this.materials[materialID].specular = specular;
                } else
                    this.onXMLMinorError(
                        "unknown tag <" + properties.nodeName + ">"
                    );
            }
        }

        this.log("Parsed materials");
        return null;
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
            case "translate":
                coordinates = this.parseCoordinates3D(
                    transformationNode,
                    "translate transformation for ID " + transformationID
                );
                if (!Array.isArray(coordinates)) {
                    this.onXMLMinorError(
                        "unable to parse translation for ID " + transformationID
                    );
                    return null;
                }

                mat4.translate(transfMatrix, transfMatrix, coordinates);
                break;
            case "scale":
                coordinates = this.parseCoordinates3D(
                    transformationNode,
                    "scale transformation for ID " + transformationID
                );
                if (!Array.isArray(coordinates)) {
                    this.onXMLMinorError(
                        "unable to parse scaling for ID " + transformationID
                    );
                    return null;
                }

                mat4.scale(transfMatrix, transfMatrix, coordinates);
                break;
            case "rotate":
                let axis = this.reader.getString(transformationNode, "axis");
                let axisVector;
                if (axis == "x") {
                    axisVector = [1, 0, 0];
                } else if (axis == "y") {
                    axisVector = [0, 1, 0];
                } else if (axis == "z") {
                    axisVector = [0, 0, 1];
                } else {
                    this.onXMLMinorError(
                        "Invalid axis '" +
                            axis +
                            "' for rotate transformation for ID " +
                            transformationID
                    );
                    return null;
                }

                let angle = this.reader.getFloat(transformationNode, "angle");
                if (!(angle != null && !isNaN(angle))) {
                    this.onXMLMinorError(
                        "unable to parse angle of the rotation for ID = " +
                            transformationID
                    );
                    return null;
                }

                mat4.rotate(
                    transfMatrix,
                    transfMatrix,
                    angle * DEGREE_TO_RAD,
                    axisVector
                );
                break;
            default:
                this.onXMLMinorError(
                    "Unexpected transformation '" +
                        transformationNode +
                        "' for ID " +
                        transformationID
                );
        }
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        let children = transformationsNode.children;

        this.transformations = [];

        let grandChildren = [];

        // Any number of transformations.
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError(
                    "unknown tag <" + children[i].nodeName + ">"
                );
                continue;
            }

            // Get id of the current transformation.
            let transformationID = this.reader.getString(children[i], "id");
            if (transformationID == null) {
                this.onXMLMinorError("no ID defined for transformation");
                continue;
            }

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null) {
                this.onXMLMinorError(
                    "ID must be unique for each transformation (conflict: ID = " +
                        transformationID +
                        ")"
                );
                continue;
            }

            grandChildren = children[i].children;
            // Specifications for the current transformation.

            let transfMatrix = mat4.create(); // Creates a 4x4 identity matrix to which transformations will be applied

            for (let j = 0; j < grandChildren.length; j++) {
                let error = this.parseSingleTransformation(
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

        this.log("Parsed transformations");
        return null;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        let children = primitivesNode.children;

        this.primitives = [];

        let grandChildren = [];

        // Any number of primitives.
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError(
                    "unknown tag <" + children[i].nodeName + ">"
                );
                continue;
            }

            // Get id of the current primitive.
            let primitiveId = this.reader.getString(children[i], "id");
            if (primitiveId == null) {
                this.onXMLMinorError("no ID defined for primitive");
                continue;
            }

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null) {
                this.onXMLMinorError(
                    "ID must be unique for each primitive (conflict: ID = " +
                        primitiveId +
                        ")"
                );
                continue;
            }

            grandChildren = children[i].children;

            // Validate the primitive type
            if (
                grandChildren.length != 1 ||
                (grandChildren[0].nodeName != "rectangle" &&
                    grandChildren[0].nodeName != "triangle" &&
                    grandChildren[0].nodeName != "cylinder" &&
                    grandChildren[0].nodeName != "sphere" &&
                    grandChildren[0].nodeName != "torus")
            ) {
                this.onXMLMinorError(
                    "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere, torus)"
                );
                continue;
            }

            // Specifications for the current primitive.
            let primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == "rectangle") {
                // <rectangle x1="ff" y1="ff" x2="ff" y2="ff" />

                // x1
                let x1 = this.reader.getFloat(grandChildren[0], "x1");
                if (!(x1 != null && !isNaN(x1))) {
                    this.onXMLMinorError(
                        "unable to parse x1 of the primitive coordinates for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // y1
                let y1 = this.reader.getFloat(grandChildren[0], "y1");
                if (!(y1 != null && !isNaN(y1))) {
                    this.onXMLMinorError(
                        "unable to parse y1 of the primitive coordinates for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // x2
                let x2 = this.reader.getFloat(grandChildren[0], "x2");
                if (!(x2 != null && !isNaN(x2) && x2 > x1)) {
                    this.onXMLMinorError(
                        "unable to parse x2 of the primitive coordinates for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // y2
                let y2 = this.reader.getFloat(grandChildren[0], "y2");
                if (!(y2 != null && !isNaN(y2) && y2 > y1)) {
                    this.onXMLMinorError(
                        "unable to parse y2 of the primitive coordinates for ID = " +
                            primitiveId
                    );
                    continue;
                }

                let rect = new MyRectangle(this.scene, x1, x2, y1, y2);

                this.primitives[primitiveId] = rect;
            } else if (primitiveType == "triangle") {
                // <triangle x1="ff" y1="ff" z1="ff"
                //           x2="ff" y2="ff" z2="ff"
                //           x3="ff" y3="ff" z3="ff" />

                // x1
                let x1 = this.reader.getFloat(grandChildren[0], "x1");
                if (!(x1 != null && !isNaN(x1))) {
                    this.onXMLMinorError(
                        "unable to parse x1 of the primitive coordinates for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // y1
                let y1 = this.reader.getFloat(grandChildren[0], "y1");
                if (!(y1 != null && !isNaN(y1))) {
                    this.onXMLMinorError(
                        "unable to parse y1 of the primitive coordinates for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // z1
                let z1 = this.reader.getFloat(grandChildren[0], "z1");
                if (!(z1 != null && !isNaN(z1))) {
                    this.onXMLMinorError(
                        "unable to parse z1 of the primitive coordinates for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // x2
                let x2 = this.reader.getFloat(grandChildren[0], "x2");
                if (!(x2 != null && !isNaN(x2))) {
                    this.onXMLMinorError(
                        "unable to parse x2 of the primitive coordinates for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // y2
                let y2 = this.reader.getFloat(grandChildren[0], "y2");
                if (!(y2 != null && !isNaN(y2))) {
                    this.onXMLMinorError(
                        "unable to parse y2 of the primitive coordinates for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // z2
                let z2 = this.reader.getFloat(grandChildren[0], "z2");
                if (!(z2 != null && !isNaN(z2))) {
                    this.onXMLMinorError(
                        "unable to parse z2 of the primitive coordinates for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // x3
                let x3 = this.reader.getFloat(grandChildren[0], "x3");
                if (!(x3 != null && !isNaN(x3))) {
                    this.onXMLMinorError(
                        "unable to parse x3 of the primitive coordinates for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // y3
                let y3 = this.reader.getFloat(grandChildren[0], "y3");
                if (!(y3 != null && !isNaN(y3))) {
                    this.onXMLMinorError(
                        "unable to parse y3 of the primitive coordinates for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // z3
                let z3 = this.reader.getFloat(grandChildren[0], "z3");
                if (!(z3 != null && !isNaN(z3))) {
                    this.onXMLMinorError(
                        "unable to parse z3 of the primitive coordinates for ID = " +
                            primitiveId
                    );
                    continue;
                }

                let triangle = new MyTriangle(
                    this.scene,
                    [x1, y1, z1],
                    [x2, y2, z2],
                    [x3, y3, z3]
                );

                this.primitives[primitiveId] = triangle;
            } else if (primitiveType == "cylinder") {
                // <cylinder base="ff" top="ff" height="ff" slices="ii" stacks="ii" />

                // base
                let base = this.reader.getFloat(grandChildren[0], "base");
                if (!(base != null && !isNaN(base))) {
                    this.onXMLMinorError(
                        "unable to parse base of the primitive for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // top
                let top = this.reader.getFloat(grandChildren[0], "top");
                if (!(top != null && !isNaN(top))) {
                    this.onXMLMinorError(
                        "unable to parse top of the primitive for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // height
                let height = this.reader.getFloat(grandChildren[0], "height");
                if (!(height != null && !isNaN(height))) {
                    this.onXMLMinorError(
                        "unable to parse height of the primitive for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // slices
                let slices = this.reader.getInteger(grandChildren[0], "slices");
                if (!(slices != null && !isNaN(slices))) {
                    this.onXMLMinorError(
                        "unable to parse slices of the primitive for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // stacks
                let stacks = this.reader.getInteger(grandChildren[0], "stacks");
                if (!(stacks != null && !isNaN(stacks))) {
                    this.onXMLMinorError(
                        "unable to parse stacks of the primitive for ID = " +
                            primitiveId
                    );
                    continue;
                }

                let cylinder = new MyCylinder(
                    this.scene,
                    base,
                    top,
                    height,
                    slices,
                    stacks
                );

                this.primitives[primitiveId] = cylinder;
            } else if (primitiveType == "sphere") {
                // <sphere radius="ff" slices="ii" stacks="ii" />

                // radius
                let radius = this.reader.getFloat(grandChildren[0], "radius");
                if (!(radius != null && !isNaN(radius))) {
                    this.onXMLMinorError(
                        "unable to parse radius of the primitive for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // slices
                let slices = this.reader.getInteger(grandChildren[0], "slices");
                if (!(slices != null && !isNaN(slices))) {
                    this.onXMLMinorError(
                        "unable to parse slices of the primitive for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // stacks
                let stacks = this.reader.getInteger(grandChildren[0], "stacks");
                if (!(stacks != null && !isNaN(stacks))) {
                    this.onXMLMinorError(
                        "unable to parse stacks of the primitive for ID = " +
                            primitiveId
                    );
                    continue;
                }

                let sphere = new MySphere(this.scene, radius, slices, stacks);

                this.primitives[primitiveId] = sphere;
            } else if (primitiveType == "torus") {
                // <torus inner="ff" outer="ff" slices="ii" loops="ii" />

                // inner
                let inner = this.reader.getFloat(grandChildren[0], "inner");
                if (!(inner != null && !isNaN(inner))) {
                    this.onXMLMinorError(
                        "unable to parse inner of the primitive for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // outer
                let outer = this.reader.getFloat(grandChildren[0], "outer");
                if (!(outer != null && !isNaN(outer))) {
                    this.onXMLMinorError(
                        "unable to parse outer of the primitive for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // slices
                let slices = this.reader.getInteger(grandChildren[0], "slices");
                if (!(slices != null && !isNaN(slices))) {
                    this.onXMLMinorError(
                        "unable to parse slices of the primitive for ID = " +
                            primitiveId
                    );
                    continue;
                }

                // loops
                let loops = this.reader.getInteger(grandChildren[0], "loops");
                if (!(loops != null && !isNaN(loops))) {
                    this.onXMLMinorError(
                        "unable to parse loops of the primitive for ID = " +
                            primitiveId
                    );
                    continue;
                }

                let torus = new MyTorus(
                    this.scene,
                    inner,
                    outer,
                    slices,
                    loops
                );

                this.primitives[primitiveId] = torus;
            } else {
                this.onXMLMinorError("unknown tag <" + primitiveType + ">");
            }
        }

        this.log("Parsed primitives");
        return null;
    }

    /**
     * Parses the <components> block.
     * @param {components block element} componentsNode
     */
    parseComponents(componentsNode) {
        let children = componentsNode.children;

        this.components = [];
        this.componentsIds = [];

        let grandChildren = [];
        let nodeNames = [];

        // First get all components before parsing them, to handle any order
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName != "component") {
                this.onXMLMinorError(
                    "unknown tag <" + children[i].nodeName + ">"
                );
                continue;
            }

            // Get id of the current component.
            let componentID = this.reader.getString(children[i], "id");
            if (componentID == null) {
                this.onXMLMinorError("no ID defined for component");
                continue;
            }

            // Checks for repeated IDs.
            if (this.components[componentID] != null) {
                this.onXMLMinorError(
                    "ID must be unique for each component (conflict: ID = " +
                        componentID +
                        ")"
                );
                continue;
            }

            this.components[componentID] = new MyComponent(this.scene, componentID);
            this.componentsIds.push(componentID);
        }

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName != "component") {
                continue;
            }

            let componentID = this.reader.getString(children[i], "id");

            grandChildren = children[i].children;
            nodeNames = [];
            for (let j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            let transformationIndex = nodeNames.indexOf("transformation");
            let materialsIndex = nodeNames.indexOf("materials");
            let textureIndex = nodeNames.indexOf("texture");
            let childrenIndex = nodeNames.indexOf("children");

            // Transformations
            if (grandChildren[transformationIndex].children.length > 0) {
                // if there are transformations
                let firstTransformation =
                    grandChildren[transformationIndex].children[0];
                if (firstTransformation.nodeName == "transformationref") {
                    // transformationref detected; should be the only transformation
                    let transformationID = this.reader.getString(
                        firstTransformation,
                        "id"
                    );
                    if (transformationID == null) {
                        this.onXMLMinorError(
                            "no ID defined for transformation"
                        );
                    }
                    if (this.transformations[transformationID] == null) {
                        this.onXMLMinorError(
                            "no transformation with ID " +
                                transformationID +
                                " defined"
                        );
                        transformationID = null;
                    }

                    if (transformationID != null) {
                        this.components[componentID].setTransformation(
                            this.transformations[transformationID]
                        );
                    }

                    // check if there are more transformations
                    if (
                        grandChildren[transformationIndex].children.length > 1
                    ) {
                        this.onXMLMinorError(
                            "transformationref must be the only transformation, ignoring others"
                        );
                    }
                } else {
                    // multiple transformations can be applied, as long as none are transformationref
                    let current_transformation = mat4.create();
                    for (let child of grandChildren[transformationIndex]
                        .children) {
                        let error = this.parseSingleTransformation(
                            componentID,
                            child,
                            current_transformation
                        );
                        if (error != null) {
                            this.onXMLMinorError(error);
                            break;
                        }
                    }
                    this.components[componentID].setTransformation(
                        current_transformation
                    );
                }
            }

            // Materials
            for (let child of grandChildren[materialsIndex].children) {
                if (child.nodeName != "material") {
                    this.onXMLMinorError(
                        "Unexpected tag <" + child.nodeName + ">"
                    );
                    continue;
                }

                let materialID = this.reader.getString(child, "id");
                if (materialID == null) {
                    this.onXMLMinorError("no ID defined for materialID");
                    continue;
                }

                if (materialID == "inherit") {
                    this.components[componentID].inheritMaterial();
                } else {
                    this.components[componentID].addMaterial(
                        this.materials[materialID]
                    );
                }
            }

            // Texture
            let textureID = this.reader.getString(
                grandChildren[textureIndex],
                "id"
            );
            if (textureID == null) {
                this.onXMLMinorError("no ID defined for textureID");
            } else {
                if (textureID == "inherit") {
                    this.components[componentID].inheritTexture();
                } else if (textureID != "none") {
                    // Parse optional length_s and length_t only if textureID is not "none" nor "inherit"
                    let length_s = this.reader.getFloat(
                        grandChildren[textureIndex],
                        "length_s",
                        false
                    );
                    if (length_s == null) {
                        length_s = 1.0;
                    }
                    let length_t = this.reader.getFloat(
                        grandChildren[textureIndex],
                        "length_t",
                        false
                    );
                    if (length_t == null) {
                        length_t = 1.0;
                    }

                    this.components[componentID].setTexture(
                        this.textures[textureID],
                        length_s,
                        length_t
                    );
                }
            }

            // Children
            for (let child of grandChildren[childrenIndex].children) {
                if (child.nodeName == "componentref") {
                    // Add a new component to the component
                    let componentref = this.reader.getString(child, "id");

                    if (this.components[componentref] == null) {
                        this.onXMLError(
                            "componentref " + componentref + " does not exist"
                        );
                        continue;
                    }

                    this.components[componentID].addChild(
                        this.components[componentref]
                    );
                } else if (child.nodeName == "primitiveref") {
                    // Add a new primitive to the component
                    let primitiveref = this.reader.getString(child, "id");

                    if (this.primitives[primitiveref] == null) {
                        this.onXMLError(
                            "primitiveref " + primitiveref + " does not exist"
                        );
                        continue;
                    }

                    this.components[componentID].addChild(
                        this.primitives[primitiveref]
                    );
                } else {
                    this.onXMLMinorError(
                        "Unexpected tag <" + child.nodeName + ">"
                    );
                }
            }
        }

        if (this.hasCycle()) {
            return "Scene graph has a cycle.";
        }
    }

    /**
     * Checks if this scene graph has a cycle
     */
    hasCycle() {
        const visited = {};
        const recStack = {};
        for (let componentId in this.components) {
            visited[componentId] = false;
            recStack[componentId] = false;
        }

        if (this.dfsCycleDetection(this.idRoot, visited, recStack)) {
            return true;
        }

        return false;
    }

    /**
     * Checks for cycles based on a dfs
     * @param {string} id - id of the node to process
     * @param {Object} visited - which nodes have been visited
     * @param {Object} recStack - which nodes are currently "on the stack"
     */
    dfsCycleDetection(id, visited, recStack) {
        if (recStack[id]) return true;
        if (visited[id]) return false;

        visited[id] = true;
        recStack[id] = true;

        for (let adjComponent of this.components[id].getChildren()) {
            // if adj is not a primitive
            if (typeof adjComponent.getChildren === "function") {
                if (this.dfsCycleDetection(adjComponent.getId(), visited, recStack)) {
                    return true;
                }
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
        let position = [];

        // x
        let x = this.reader.getFloat(node, "x");
        if (!(x != null && !isNaN(x))) {
            x = 0;
            this.onXMLError(
                "unable to parse x-coordinate of the " + messageError
            );
        }

        // y
        let y = this.reader.getFloat(node, "y");
        if (!(y != null && !isNaN(y))) {
            y = 0;
            this.onXMLError(
                "unable to parse y-coordinate of the " + messageError
            );
        }

        // z
        let z = this.reader.getFloat(node, "z");
        if (!(z != null && !isNaN(z))) {
            z = 0;
            this.onXMLError(
                "unable to parse z-coordinate of the " + messageError
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

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position)) return position;

        // w
        let w = this.reader.getFloat(node, "w");
        if (!(w != null && !isNaN(w))) {
            w = 0;
            this.onXMLError(
                "unable to parse w-coordinate of the " + messageError
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
    parseColor(node, messageError) {
        let color = [];

        // R
        let r = this.reader.getFloat(node, "r");
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1)) {
            this.onXMLError(
                "unable to parse R component of the " + messageError
            );
            r = 0;
        }

        // G
        let g = this.reader.getFloat(node, "g");
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1)) {
            g = 0;
            this.onXMLError(
                "unable to parse G component of the " + messageError
            );
        }

        // B
        let b = this.reader.getFloat(node, "b");
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1)) {
            b = 0;
            this.onXMLError(
                "unable to parse B component of the " + messageError
            );
        }

        // A
        let a = this.reader.getFloat(node, "a");
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1)) {
            a = 0;
            this.onXMLError(
                "unable to parse A component of the " + messageError
            );
        }

        color.push(...[r, g, b, a]);

        return color;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        if (this.components[this.idRoot] != null) {
            this.components[this.idRoot].display();
        }
    }
}
