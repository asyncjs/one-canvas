/* Create a new module object. The parent window should call createModule()
 * with an id. This will set up a socket.io connection listening in on the
 * id. This will create a global module object that can be used in the user
 * scripts.
 *
 * Example:
 *
 *   window.createModule('mymoduleid');
 *   window.module.ready(function () {
 *     console.log('It has loaded');
 *   });
 *
 */
(function () {
  var Broadcast = window.Broadcast.noConflict();

  function Client(id, module, socket) {
    this.id = id;
    this.module = module;
    this.socket = socket;

    this.module.events.on('all', this.onModuleEvent, this);
    console.log("listening on socket id ", id);
    this.socket.on(id, this.onSocketEvent.bind(this));
  }

  Client.prototype = {
    constructor: Client,
    initialize: function () {
      this._createCanvas();
      this.module.events.emit('ready');
      this.socket.emit('ready');
    },
    _createCanvas: function () {
      // Provides a default thing to work with, scripts are free to
      // ignore or delete it
      var canvas = document.createElement('canvas');
      canvas.width = document.width;
      canvas.height = document.height;
      
      document.body.appendChild(canvas);
      // So that the scripts can just access the canvas
      window.canvas = canvas;
    },
    onModuleEvent: function (topic, data) {
      this.socket.emit(this.id, {type: topic, data: data || {}});
    },
    onSocketEvent: function (data) {
      this.module.event.trigger('message', {type: data.topic, data: data.data || {}});
    }
  };

  function Sandbox() {
    this.events = new Broadcast();
    this.events.on('ready', function () {
      this.ready.fired = true;
    }, this);
  }

  Sandbox.prototype = {
    constructor: Sandbox,
    ready: function (fn, context) {
      if (this.ready.fired === true) {
        setTimeout(fn.bind(context), 0);
      } else {
        this.events.on('ready', fn, context);
      }
      return this;
    },
    message: function (fn, context) {
      this.events.on('message', fn, context);
      return this;
    },
    send: function () {
      this.events.emit.apply(this.events, arguments);
      return this;
    },
    load: function (src, fn) {
      var script = document.createElement('script');
      script.src = src;
      script.addEventListener('load', fn);
      return this;
    }
  };

  require.config({
    baseUrl: "/js/vendor"
  });

  window.createModule = function (id) {
    if (window.module) { return window.module; }

    var module = window.module = new Sandbox();
    var socket = io.connect('http://localhost:8000');
    var client = new Client(id, module, socket);

    if (document.readyState === 'complete') {
      client.initialize();
    } else {
      document.addEventListener('DOMContentLoaded', client.initialize.bind(client));
    }
  };
})();
