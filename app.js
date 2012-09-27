#!/usr/bin/env node
var express = require('express')
  , app = express()
  , fs = require('fs')
  , path = require('path')
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , argv = require('optimist')
      .default('port', process.env.VMC_APP_PORT || 8000)
      .default('listen', "0.0.0.0")
      .default('canvasroot', "canvases/")
      .argv
  , base = argv.canvasroot
  , mongodb = require("mongodb")
  , mongo = {
      "hostname":"localhost",
      "port":27017,
      "username":"",
      "password":"",
      "name":"",
      "db":"onecanvas"
  }
;

//appfog config
if(process.env.VCAP_SERVICES){
  var env = JSON.parse(process.env.VCAP_SERVICES);
  mongo = env['mongodb-1.8'][0]['credentials'];
}

var mongourl = "mongodb://" + mongo.username + ":" + mongo.password + "@" + mongo.hostname
var onedb = new mongo.Db('test', new Server(mongourl, mongo.port, {auto_reconnect: true})),

onedb.open(function(err,db) {
  
  server.listen(argv.port, argv.listen);

  app.use(express.static('client/assets'));
  app.use(express.bodyParser());

  app.get('/mobile/:id', function (req, res) {
    //TODO: check the file exists
    res.sendfile(__dirname + '/client/mobile.html');
  });

  app.get('/grid', function (req, res) {
    res.sendfile(__dirname + '/client/grid.html');
  });

  app.get('/get/:src', function (req, res, next) {
    var src = req.params.src;
    var clean = req.query['clean'];

    onedb.get('canvas', {src: src}, function(err, body) {
      var string = body.src.toString('utf-8');
      var requires = [];

      string.replace(/require\((.*?)\)/g, function (_, file) {
        requires.push(file);
      });

      // The editor does not need the require crap in.
      if( !clean ) {
        string = 'require([' + requires.join(', ') + '], function () {\n' + string + '\n});';
      }
      res.send(string);
    });
  });

  app.get('/', function(req, res) {
    // redirect the user to a random page.
    res.redirect('/grid');
  });

  app.get('/canvas', function(req, res) {
    // generate an id
    var id = getUniqueCanvasId();
    res.redirect('/canvas/' + id + '/edit');
  });

  app.get('/canvas/:id/view', function(req, res) {
    res.sendfile(__dirname + '/client/view.html');
  });

  app.get('/canvas/:id/edit', function(req, res) {
    res.sendfile(__dirname + '/client/edit.html');
  });

  app.post('/canvas/:id/save', function(req, res) {
    var name    = req.params.id
      ,content = req.body.content
      ,publish = req.body.publish
      ,type = req.body.type
    ;

    onedb.insert({ type: type, name: name, src: src, publish: publish }, 'canvas', 
      function(err, body, header) {
      if (err) {
        console.log('[onedb.insert] ', err.message);
        res.send(500, "Fail");
      } else {
        console.log("Wrote", fname);
        res.send(201, "Saved");
      }
    });
  });

  app.get('/list', function(req, res) {
    var resp = [];
    onedb.get('canvas', function(err, body) {
      resp.push({
        ts: object
        src: "/get/" + file
      });
    });
    res.send(200, resp);
  });


  // GLOBAL!!
  var getUniqueCanvasId = function() {
    var id = Math.floor(Math.random() * 1000) + 1000;
    var file;

    try {
      file = fs.openSync(base + id + '.js', 'r');
      return getUniqueCanvasId();
    }
    catch(ex) {
      // file not found - the ID's unique.
      return id;
    }
  }

  io.sockets.on('connection', function (socket) {
    socket.on('global', function(to, data) { });
    socket.on('paint', function (to, data) {
      io.sockets.emit(to, {topic: 'cursor', data: data});
    });
  });
});
