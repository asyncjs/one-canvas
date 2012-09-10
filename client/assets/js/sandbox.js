/* Create a new canvas object. The parent window should call createCanvas()
 * with an id. This will set up a socket.io connection listening in on the
 * id. This will create a global canvas object that can be used in the user
 * scripts.
 *
 * Example:
 *
 *   window.createCanvas('mycanvasid');
 *   window.canvas.ready(function () {
 *     console.log('It has loaded');
 *   });
 *
 */
(function () {
  var Broadcast = window.Broadcast.noConflict();

  function Client(id, canvas, socket) {
    this.id = id;
    this.canvas = canvas;
    this.socket = socket;

    this.canvas.events.on('all', this.onCanvasEvent, this);
    this.socket.on(id, this.onSocketEvent.bind(this));
  }

  Client.prototype = {
    constructor: Client,
    initialize: function () {
      this.canvas.events.emit('ready');
      this.socket.emit('ready');
    },
    onCanvasEvent: function (topic, data) {
      this.socket.emit(this.id, {type: topic, data: data || {}});
    },
    onSocketEvent: function (data) {
      this.canvas.event.trigger('message', {type: data.topic, data: data.data || {}});
    }
  };

  function Sandbox() {
    this.events = new Broadcast();
  }

  Sandbox.prototype = {
    constructor: Sandbox,
    ready: function (fn, context) {
      this.events.on('ready', fn, context);
      return this;
    },
    message: function (fn, context) {
      this.events.on('message', fn, context);
      return this;
    },
    send: function () {
      this.events.emit.call(this.events, arguments);
      return this;
    },
    load: function (src, fn) {
      var script = document.createElement('script');
      script.src = src;
      script.addEventListener('load', fn);
      return this;
    }
  };

  window.createCanvas = function (id) {
    if (window.canvas) { return window.canvas; }

    var canvas = window.canvas = new Sandbox();
    var socket = io.connect('http://localhost:8000');
    var client = new Client(id, canvas, socket);

    if (document.readyState === 'complete') {
      client.initialize();
    } else {
      document.addEventListener('DOMContentLoaded', client.initialize.bind(client));
    }
  };
})();
