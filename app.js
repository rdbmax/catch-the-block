const express = require('express');
const app = express();
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

    app.use(express.static('public'));

    // connexion d'un internaute
    io.sockets.on('connection', function (socket) {
        // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
        socket.on('nouveau_client', function (message) {
            var pseudo = encode(message.pseudo);
            socket.pseudo = pseudo;
            socket.broadcast.emit('nouveau_client', message);
            console.log('NOUVEAU CLIENT : '+pseudo);
            socket.emit('load_partners', { balls : balls, target : target });
            balls[pseudo] = message;
        });

        socket.on('move', function (message) {
            var pseudo = socket.pseudo;
            balls[pseudo].position = message;
            socket.broadcast.emit('move', { pseudo: pseudo, position: message });
            console.log(message);
            console.log(target);
            if( JSON.stringify(message) == JSON.stringify(target) ) {
                console.log(pseudo+' scored');
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
            console.log(pseudo + ' got disconnect!');
            socket.broadcast.emit('deconnexion', pseudo);
            console.log(balls);
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
        console.log(toReturn);
        io.sockets.emit('newTarget', toReturn);
    }

    newTarget();
    server.listen(port);
});
