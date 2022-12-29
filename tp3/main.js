import {CGFapplication} from '../lib/CGF.js';
import {XMLscene,GAME_SCENE_STATE} from './XMLscene.js';
import {MyInterface} from './MyInterface.js';
import {MySceneGraph} from './MySceneGraph.js';

function getUrllets() {
    const lets = {};
    const parts = window.location.href.replace(
        /[?&]+([^=&]+)=([^&]*)/gi,
        function(m, key, value) {
            lets[decodeURIComponent(key)] = decodeURIComponent(value);
        }
    );
    return lets;
}

function resetScene() {
    let bodyEle = document.getElementsByTagName("body")[0];
    let canvasEle = bodyEle.getElementsByTagName("canvas")[0];
    let interfaceEle = bodyEle.getElementsByClassName("dg ac")[0];

    if (canvasEle) {
        bodyEle.removeChild(canvasEle);
    }

    if (interfaceEle) {
        interfaceEle.firstChild.remove();
    }
}

function changeScene(sceneName, game_scene_state=GAME_SCENE_STATE.PLAYING, scenariosNames=[]) {
    resetScene();

    // Standard application, scene and interface setup
    const app = new CGFapplication(document.body);
    const myInterface = new MyInterface();
    const myScene = new XMLscene(myInterface);

    app.init();

    app.setScene(myScene);
    app.setInterface(myInterface);

    myInterface.setActiveCamera(myScene.camera);

    // create and load graph, and associate it to scene.
    // Check console for loading errors
    const myGraph = new MySceneGraph(sceneName, myScene);

    // Game specific setup
    myScene.initGame(game_scene_state, scenariosNames, changeScene);

    // start
    app.run();
}

function main() {
    const availableScenes = ["empty.xml", "space.xml"];

    changeScene("main-menu.xml", GAME_SCENE_STATE.MAIN_MENU, availableScenes);
}

main();
