var app = require('express')(),
    port = process.env.PORT || 5000,
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs'),
    dns = require('dns'),
    os = require('os'),
    balls = {},
    target = {};

// démarage du server
dns.lookup(os.hostname(), function (err, add, fam) {

    console.log(add+':'+port); //affichage de l'ip du server

    // requete http sur la racine du server
    app.get('/', function (req, res) {
      res.sendfile(__dirname + '/game3d.html');
    });

    app.get('/three.min.js', function (req, res) {
      res.sendfile(__dirname + '/three.min.js');
    });

    app.get('/jquery.js', function (req, res) {
      res.sendfile(__dirname + '/jquery.js');
    });

    // connexion d'un internaute
    io.sockets.on('connection', function (socket) {

        // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
        socket.on('nouveau_client', function (message) {
            var pseudo = ent.encode(message.pseudo);
            socket.set('pseudo', pseudo);
            socket.broadcast.emit('nouveau_client', message);
            console.log('NOUVEAU CLIENT : '+pseudo);
            socket.emit('load_partners', { balls : balls, target : target });
            balls[pseudo] = message;
        });

        socket.on('move', function (message) {
            socket.get('pseudo', function (error, pseudo) {
                balls[pseudo].position = message;
                socket.broadcast.emit('move', {pseudo: pseudo, position: message});
                if( JSON.stringify(message) == JSON.stringify(target) ) {
                    console.log(pseudo+' scored');
                    balls[pseudo].score ++;
                    newTarget();
                    socket.emit('scoreUp', pseudo);
                    socket.broadcast.emit('scoreUp', pseudo);
                }
            });
        });

        // Deconnexion de l'internaute
        socket.on('disconnect', function () {
          socket.get('pseudo', function (error, pseudo) {
            delete balls[pseudo];
            console.log(pseudo + ' got disconnect!');
            socket.broadcast.emit('deconnexion', pseudo);
            console.log(balls);
          });
       });
    });

    //création d'une nouvelle cible
    function newTarget() {
        var toReturn = {
            x : Math.round(Math.random()*20),
            y : 0,
            z : Math.round(Math.random()*20)
        };
        target = toReturn;
        console.log(toReturn);
        io.sockets.emit('newTarget', toReturn);
    }

    newTarget();
    server.listen(port);

});