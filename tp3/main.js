import {CGFapplication} from '../lib/CGF.js';
import {XMLscene} from './XMLscene.js';
import {MyInterface} from './MyInterface.js';
import {MySceneGraph} from './MySceneGraph.js';
import {CONFIG} from './game/config.js';

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
    const bodyEle = document.getElementsByTagName("body")[0];
    const canvasEle = bodyEle.getElementsByTagName("canvas")[0];
    const interfaceEle = bodyEle.getElementsByClassName("dg ac")[0];

    if (canvasEle) {
        bodyEle.removeChild(canvasEle);
    }

    if (interfaceEle) {
        interfaceEle.firstChild.remove();
    }
}

function changeScene(sceneName, player1Name, player2Name) {
    // Standard application, scene and interface setup
    const app = new CGFapplication(document.body);
    const myInterface = new MyInterface();
    const myScene = new XMLscene(myInterface, sceneName);

    app.init();

    app.setScene(myScene);
    app.setInterface(myInterface);

    myInterface.setActiveCamera(myScene.camera);

    // create and load graph, and associate it to scene.
    // Check console for loading errors
    const myGraph = new MySceneGraph(sceneName, myScene);

    // Game specific setup
    myScene.initGame((x, y, z) => {
        if (x === CONFIG.menu) {
            window.location.reload();
        } else {
            resetScene();
        }
        changeScene(x, y, z);
    }, player1Name, player2Name);

    // start
    app.run();
}

function main() {
    const filename = getUrllets()['file'] || CONFIG.menu;
    changeScene(filename);
}

main();
