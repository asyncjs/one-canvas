#!/usr/bin/env node
var express = require('express')
  , app = express()
  , fs = require('fs')
  , path = require('path')
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , argv = require('optimist')
      .default('port', 8000)
      .default('canvasroot', "canvases/")
      .argv
  , base = argv.canvasroot
  ;

server.listen(argv.port);

app.use(express.static('client/assets'));
app.use(express.bodyParser());

app.get('/client/:id', function (req, res) {
  //load the named file from dropbox
  res.sendfile(__dirname + '/client/index.html');
});


app.get('/grid', function (req, res) {
  res.sendfile(__dirname + '/client/grid.html');
});

app.get('/get/:src', function (req, res) {
  var src = req.params.src
  //SUPER SEKURE
  res.sendfile(__dirname  + '/' + base + src);
});

app.get('/canvas/:id/view', function(req, res) {
  
});

app.get('/canvas/:id/edit', function(req, res) {
  res.sendfile(__dirname + '/client/edit.html');
});

app.post('/canvas/:id/save', function(req, res) {
  var name = req.params.id
     ,content = req.body.content
  ;

  if(/[^A-Za-z0-9\-_]/.test(name)) {
    res.send(500, "invalid filename a-zA-Z0-9-_");
  } else {
    fs.writeFile(base + name + ".js", content, function (err) {
      if (err) throw err;
      console.log("Saved ", name);
      res.send(201, "Saved");
    });
  }
});

app.get('/list', function(req, res) {
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
