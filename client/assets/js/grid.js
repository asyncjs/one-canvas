var ROWS = 3,
    COLS = 3;
$(document).ready(function () {
  var scripts = [];
  var width = parseInt($(window).width()/COLS,10), 
      height = parseInt($(window).height()/ROWS,10);
  var sessionId = Math.random();
  
  function reset() {
    window.sandboxes = [];
    $('#grid').children().remove();
    // Create the iframes
    for(var r = 0; r < ROWS; r++) {
      for(var c = 0; c < COLS; c++) {
        var sandbox = {iframe: null, row: r, col: c, script: null};
        window.sandboxes.push(sandbox);
        updateSandbox(sandbox);
      }
    }
  }
  reset();

  function getNextScript(callback) {
    $.getJSON('/list', function (data) {
      // Get a list of currently shown scripts
      var currentlyShown = {};
      for(var i = 0; i < window.sandboxes.length; i++) {
        if (window.sandboxes[i].script) {
          currentlyShown[window.sandboxes[i].script.src] = true;
        }
      }
      var scripts = _.filter(data, function (script) { return !currentlyShown[script.src]; });
      if (scripts.length == 0) {
        scripts = data;
      }
      scripts = _.sortBy(scripts, function (script) { return -script.ts; });
      for(var i = 0; i < scripts.length; i++) {
        if (Math.random() < 0.66) {
          return callback(scripts[i]);
        }
      }
      return callback(scripts[0]);
    });
  }

  function injectScript(iframe, src, callback) {
    // Inject code into the sandbox
    var script = document.createElement('script');
    script.src = src; 
    iframe[0].contentDocument.body.appendChild(script);
    script.onload = callback;
  }

  function injectCSS(iframe, src, callback) {
    // Inject code into the sandbox
    var link = document.createElement('link');
    link.href = src;
    link.type = "text/css";
    link.rel = "stylesheet";
    iframe[0].contentDocument.body.appendChild(link);
    callback();
  }

  function updateSandbox(sandbox) {
    getNextScript(function (script) {
      if (sandbox.iframe) {
        try { sandbox.iframe.remove(); } catch (e) { }
      }
      sandbox.script = script;
      sandbox.iframe = $('<iframe>');
      sandbox.iframe.css(
        {width: width, height: height, top: sandbox.row*height, left: sandbox.col*width});
      $('#grid').append(sandbox.iframe);
      sandbox.id = "SANDBOX" + Math.random() + '_' + (new Date()).getTime();
      sandbox.lastUpdated = (new Date()).getTime();
      sandbox.iframe[0].contentWindow.Broadcast = window.Broadcast;
      injectCSS(sandbox.iframe, "/css/screen.css", function () {
        injectScript(sandbox.iframe, "/socket.io/socket.io.js", function () {
          injectScript(sandbox.iframe, "/js/broadcast.js", function () {
            injectScript(sandbox.iframe, "/js/sandbox.js", function () {
              sandbox.iframe[0].contentWindow.createCanvas(sandbox.id);
              injectScript(sandbox.iframe, script.src + "?" + Math.random(), function () {
              });
            });
          });
        });
      });
    });
  }

  function updateNextSandbox() {
    var sandboxes = _.sortBy(window.sandboxes, function (sb) {return -sb.lastUpdated;})
    updateSandbox(sandboxes);
  }
  setInterval(updateSandbox, 30000);
  
});
