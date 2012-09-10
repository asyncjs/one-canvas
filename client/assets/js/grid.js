var ROWS = 3,
    COLS = 3;
$(document).ready(function () {
  var scripts = [];
  var width = $(window).width()/COLS, height = $(window).height()/ROWS;
  
  function reset() {
    window.sandboxes = [];
    $('#grid').children().remove();
    // Create the iframes
    for(var r = 0; r < ROWS; r++) {
      for(var c = 0; c < COLS; c++) {
        var sandbox = {iframe: null, row: r, col: c, script: null};
        window.sandboxes.push(sandboxes);
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
    script.src = src + "?" + Math.random()
    iframe.contentDocument.body.appendChild(script);
    script.onload = callback;
  }

  function updateSandbox(sandbox) {
    getNextScript(function (script) {
      if (sandbox.iframe) {
        sandbox.iframe.remove();
      }
      sandbox.script = script;
      sandbox.iframe = $('<iframe style="border: 1px solid black; position: fixed">');
      sandbox.iframe.css({width: width, height: height, top: sandbox.row*height, left: sandbox.col*width});
      $('#grid').append(sandbox.iframe);
      sandbox.id = "SANDBOX" + (new Date()).getTime();
      sandbox.lastUpdated = (new Date()).getTime();
      injectScript(sandbox.iframe, "/socket.io/socket.io.js", function () {
        injectScript(sandbox.iframe, "/js/broadcast.js", function () {
          injectScript(sandbox.iframe, "/js/sandbox.js", function () {
            iframe.contentWindow.createCanvas(sandbox.id);
            injectScript(sandbox.iframe, script.src, function () {
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
