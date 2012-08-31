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

app.get('/canvas/:id', function (req, res) {
  res.sendfile(__dirname + '/client/index.html');
});
app.use(express.static('client/assets'));
io.sockets.on('connection', function (socket) {
  socket.on('paint', function (data) {
    console.log(data);
  });
});
