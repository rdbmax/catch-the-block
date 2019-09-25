import socket, {
    DECONNEXION,
    SCORE_UP,
    NEW_TARGET,
    MOVE,
    NEW_PLAYER,
    LOAD_PLAYERS
} from './api'
import store from './store';
import {
    randomPosition,
    randomColor
} from './helpers';

// store.subscribe(() => console.log(store.getState()))
// store.dispatch({ type: 'INCREMENT' })
// console.log(
//     store.getState()
// )

function generateScoreSection (name, userScore, isCurrentPlayer) {
    var scoreSection = document.createElement("p"),
        score = document.createElement("span"),
        displayName = isCurrentPlayer ? ('Me (' + name + ')') : name;
    scoreSection.id = 'label_' + name;
    score.id = 'score_' + name;
    score.append(userScore);
    scoreSection.append(displayName + ' : ');
    scoreSection.appendChild(score);
    return scoreSection;
}

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xe0e0e0 );
scene.fog = new THREE.Fog( 0xe0e0e0, 20, 100 );

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
camera.position.set( -15, 10, 10 );
camera.lookAt( scene.position );

const light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
light.position.set(-10, 20, 10);

const grid = new THREE.GridHelper( 200, 40, 0x000000, 0x000000 );
grid.material.opacity = 0.2;
grid.material.transparent = true;

const ground = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
ground.rotation.x = - Math.PI / 2;

scene.add(light);
scene.add(ground);
scene.add(grid);

const onWindowLoaded = function() {
    var myCube, addCube, group = {};

    function init () {
        document.body.appendChild(renderer.domElement);
        renderer.render(scene, camera);

        window.addEventListener('resize', onWindowResize, false);
        function onWindowResize() {
            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize( window.innerWidth, window.innerHeight );
        }

        document.onkeydown = checkKey;
        function checkKey(e) {
            e = e || window.event;
            if( e.keyCode == '37' || e.keyCode == '38' || e.keyCode == '39' || e.keyCode == '40' ) {
                e.preventDefault();
                going(e.keyCode);
                emitMove(e.keyCode);
            }
        }
        function going(direction) {
            if (direction == '37') myCube.position.z -= 1;
            else if (direction == '38') myCube.position.x += 1;
            else if (direction == '39') myCube.position.z += 1;
            else if (direction == '40') myCube.position.x -= 1;

            camera.position.set(myCube.position.x - 10, myCube.position.y + 10, myCube.position.z);
            camera.lookAt(myCube.position.x, myCube.position.y, myCube.position.z)
        }

        socket.emit(NEW_PLAYER, addCube({mine:true}));

        var scoreContainer = document.createElement("div");
        scoreContainer.id = 'scores';
        var scoreSection = generateScoreSection(myCube.name, 0, true);
        scoreContainer.appendChild(scoreSection);
        document.getElementsByTagName('body')[0].append(scoreContainer);
    }
    function animate() {
        requestAnimationFrame( animate );
        render();
    }
    function render() {
        renderer.render(scene, camera);
    }
    function addCube(obj) {
        var pos, pseudo, color;
        if( obj.position ) pos = obj.position;
        else pos = randomPosition();
        if( obj.pseudo ) pseudo = obj.pseudo;
        else pseudo = prompt('Quel est ton pseudo ?');
        if( obj.color ) color = obj.color;
        else color = randomColor();
        var geometry = new THREE.BoxGeometry(2, 2, 2),
        material = new THREE.MeshPhongMaterial({
            ambient: 0x030303,
            color: color,
            specular: 0x009900,
            shininess: 30,
            shading: THREE.FlatShading
        }),
        mesh = new THREE.Mesh( geometry, material );
        mesh.position.set(pos.x, pos.y, pos.z);// = pos;
        mesh.name = pseudo;
        if( obj.mine ) {
            mesh.userData.score = 0;
            myCube = mesh;

            camera.position.set(pos.x, pos.y + 20, pos.z);
            camera.lookAt(pos.x, pos.y, pos.z);

            scene.add(myCube);
        }
        else if(obj.add) scene.add( mesh );
        return {
            pseudo : pseudo,
            position: pos,
            scale: { x : 0, y : 0, z : 0},
            color: color,
            score: 0
        };
    }
    init();
    animate();

    socket.on(LOAD_PLAYERS, function (obj) {
        Object.keys(obj.balls).forEach(function (key) {
            var message = obj.balls[key];
            group[message.pseudo] = message;
            addCube({
                position: message.position,
                pseudo: message.pseudo,
                color: message.color,
                add: true
            });

            var scoreSection = generateScoreSection(message.pseudo, message.score);
            document.getElementById('scores').appendChild(scoreSection);
        });

        addCube({
            position : obj.target,
            add : true,
            color : 'white',
            pseudo : 'target'
        });
    });

    socket.on(NEW_PLAYER, function (message) {
        group[message.pseudo] = message;
        addCube({
            position: message.position,
            pseudo: message.pseudo,
            color: message.color,
            add: true
        });

        var scoreSection = generateScoreSection(message.pseudo, 0);
        document.getElementById('scores').appendChild(scoreSection);
    });

    function emitMove(codeMove) {
        socket.emit(MOVE, myCube.position);
    }

    socket.on(MOVE, function (message) {
        scene.children.forEach(function (sceneChild) {
            if( sceneChild.name == message.pseudo ) {
                sceneChild.position.x = message.position.x;
                sceneChild.position.y = message.position.y;
                sceneChild.position.z = message.position.z;
            };
        });
    });

    socket.on(NEW_TARGET, function (data) {
        scene.children.forEach(function (sceneChild) {
            if( sceneChild != undefined ) if( sceneChild.name == 'target' ) scene.remove(sceneChild);
        });
        addCube({
            position : data,
            add : true,
            color : 'white',
            pseudo : 'target'
        });
    });

    socket.on(SCORE_UP, function (name) {
        var newScore = (name == myCube.name)
            ? ++myCube.userData.score
            : ++group[name].score;
        document.getElementById('score_' + name).innerText = newScore;
    });

    socket.on(DECONNEXION, function (pseudo) {
        document.getElementById('label_' + pseudo).remove();
        scene.children.forEach(function (sceneChild) {
            if( sceneChild != undefined ) if( sceneChild.name == pseudo ) scene.remove(sceneChild);
        });
    });
};

export default onWindowLoaded;
