#!/usr/bin/env node
var express = require('express')
  , app = express()
  , fs = require('fs')
  , path = require('path')
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , argv = require('optimist')
      .default('port', 80)
      .argv
  ;

server.listen(argv.port);

app.use(express.static('client/assets'));

app.get('/client/:id', function (req, res) {
  //load the named file from dropbox
  res.sendfile(__dirname + '/client/index.html');
});

app.get('/canvas/:id/view', function(req, res) {
  
});

app.get('/canvas/:id/edit', function(req, res) {
  
});

app.get('/list', function(req, res) {
  var base = "src/";
  var resp = [];
  fs.readdir(base, function(err, files) {
    files.forEach(function(file) {
      if(/\.(js|coffee)$/.test(file)) {
        var stat = fs.statSync(base+file);
        resp.push({
          ts: Date.parse(stat.mtime),
          src: "/get/" + file
        });
      }
    });
    res.send(200, resp);
  });
});

io.sockets.on('connection', function (socket) {
  socket.on('paint', function (data) {
    console.log(data);
  });
});
