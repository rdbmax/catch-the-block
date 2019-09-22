import express from 'express';
import encode from 'ent/encode.js';
import dns from 'dns';
import os from 'os';
import morgan from 'morgan';
import http from 'http';
import socketIO  from 'socket.io';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import {
    DECONNEXION,
    SCORE_UP,
    NEW_TARGET,
    MOVE,
    NEW_PLAYER,
    LOAD_PLAYERS
} from './shared/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = socketIO.listen(server);
const balls = {};
let target = {};

console.log(SCORE_UP, __dirname);

dns.lookup(os.hostname(), function (err, add, fam) {
    console.log('http://' + add + ':' + port); //affichage de l'ip du server

    app.use(morgan('tiny'));
    app.use(express.static('public'));

    app.get('/three.min.js', function (req, res) {
        res.sendFile(__dirname + '/node_modules/three/build/three.min.js');
    });

    // connexion d'un internaute
    io.sockets.on('connection', function (socket) {
        // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
        socket.on(NEW_PLAYER, (message) => {
            var pseudo = encode(message.pseudo);
            socket.pseudo = pseudo;
            socket.broadcast.emit(NEW_PLAYER, message);
            socket.emit(LOAD_PLAYERS, { balls: balls, target: target });
            balls[pseudo] = message;
        });

        socket.on(MOVE, (message) => {
            var pseudo = socket.pseudo;
            balls[pseudo].position = message;
            socket.broadcast.emit(MOVE, { pseudo: pseudo, position: message });
            if(JSON.stringify(message) == JSON.stringify(target)) {
                balls[pseudo].score ++;
                newTarget();
                socket.emit('scoreUp', pseudo);
                socket.broadcast.emit('scoreUp', pseudo);
            }
        });

        // Deconnexion de l'internaute
        socket.on('disconnect', () => {
            const pseudo = socket.pseudo;
            delete balls[pseudo];
            socket.broadcast.emit(DECONNEXION, pseudo);
        });
    });

    //création d'une nouvelle cible
    function newTarget() {
        var toReturn = {
            x : Math.round(Math.random()*20),
            y : 1,
            z : Math.round(Math.random()*20)
        };
        target = toReturn;
        io.sockets.emit(NEW_TARGET, toReturn);
    }

    newTarget();
    server.listen(port);
});
