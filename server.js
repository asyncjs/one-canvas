#!/usr/bin/env node
var express = require('express')
  , app = express()
  , fs = require('fs')
  , path = require('path')
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , argv = require('optimist')
      .default('port', 8000)
      .default('listen', "0.0.0.0")
      .default('canvasroot', "canvases/")
      .argv
  , base = argv.canvasroot
  ;

//176.58.108.74
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

  // THIS IS NOT A GOOD IDEA KIDS!!!
  fs.readFile(__dirname + '/' + base + src, function (err, buffer) {
    if( err || !buffer ) {
      return next(err);
    }

    var string = buffer.toString('utf-8');
    var requires = [];

    string.replace(/require\((.*?)\)/g, function (_, file) {
      requires.push(file);
    });

    // The editor does not need the require crap in.
    if( !clean ) {
      string = 'require([' + requires.join(', ') + '], function (require) {\n' + string + '\n});';
    }

    res.send(string);
  });
});

app.get('/', function(req, res) {
  // redirect the user to a random page.
  var id = getUniqueCanvasId();
  res.redirect('/canvas/' + id + '/edit');
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
     ,ext = "." + (req.body.type === "coffeescript" ? "coffee" : "js")
     ,fname = base + name + ext
  ;

  if(/[^A-Za-z0-9\-_]/.test(name)) {
    res.send(500, "invalid filename a-zA-Z0-9-_");
  } else {
    fs.writeFile(fname + ".tmp", content, function (err) {
      if (err) throw err;
      res.send(201, "Saved");
      if(req.body.publish) {
        fs.writeFile(fname, content, function (err) {});
        console.log("Published", fname);
      }
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

