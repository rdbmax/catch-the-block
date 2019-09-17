const express = require('express');
const app = express();
const morgan = require('morgan');
var port = process.env.PORT || 5000,
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    encode = require('ent/encode'),
    dns = require('dns'),
    os = require('os'),
    balls = {},
    target = {};

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
        socket.on('nouveau_client', function (message) {
            var pseudo = encode(message.pseudo);
            socket.pseudo = pseudo;
            socket.broadcast.emit('nouveau_client', message);
            socket.emit('load_partners', { balls : balls, target : target });
            balls[pseudo] = message;
        });

        socket.on('move', function (message) {
            var pseudo = socket.pseudo;
            balls[pseudo].position = message;
            socket.broadcast.emit('move', { pseudo: pseudo, position: message });
            if( JSON.stringify(message) == JSON.stringify(target) ) {
                balls[pseudo].score ++;
                newTarget();
                socket.emit('scoreUp', pseudo);
                socket.broadcast.emit('scoreUp', pseudo);
            }
        });

        // Deconnexion de l'internaute
        socket.on('disconnect', function () {
            var pseudo = socket.pseudo;
            delete balls[pseudo];
            socket.broadcast.emit('deconnexion', pseudo);
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
        io.sockets.emit('newTarget', toReturn);
    }

    newTarget();
    server.listen(port);
});
