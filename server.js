#!/usr/bin/env node
var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , argv = require('optimist')
      .default('port', 80)
      .argv
  ;

server.listen(argv.port);

app.use(express.static('client/assets'));

app.get('/canvas/:id', function (req, res) {
  //load the named file from dropbox
  res.sendfile(__dirname + '/client/index.html');
});

io.sockets.on('connection', function (socket) {
  socket.on('paint', function (data) {
    console.log(data);
  });
});
