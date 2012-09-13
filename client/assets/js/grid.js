/*
 * Handles the client side for the grid. Displaying and reloading the
 * sandboxed scripts.
 */
var ROWS = 3,
    COLS = 3,
    URL_HEIGHT = 20;
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
        // set up div with url to mobile thingy
        sandbox.urlDisplay = $('<div class="url">');
        $('#grid').append(sandbox.urlDisplay);
        sandbox.urlDisplay.css({"max-width": width, height: URL_HEIGHT, top: (r+1)*height-URL_HEIGHT, left: c*width});
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
  
  function updateSandbox(sandbox) {
    getNextScript(function (script) {
      if (sandbox.iframe) {
        sandbox.iframe.remove();
      }
      sandbox.script = script;
      var name = script.src.match(/\/get\/(.*)\.js/);
      sandbox.id = name[1]
      //sandbox.id = "SANDBOX" + Math.random() + '_' + (new Date()).getTime();
      sandbox.iframe = $('<iframe>');
      sandbox.iframe.css(
        {width: width,
         height: height,
         top: sandbox.row*height,
         left: sandbox.col*width});
      $('#grid').append(sandbox.iframe);
      sandbox.lastUpdated = (new Date()).getTime();
      setupSandboxIFrame(sandbox.iframe, sandbox.id, sandbox.script.src);

      sandbox.urlDisplay.text("http://" + document.location.host + "/mobile/" + sandbox.id);
    });
  }

  function updateNextSandbox() {
    var sandboxes = _.sortBy(window.sandboxes, function (sb) {return sb.lastUpdated;})
    updateSandbox(sandboxes[0]);
  }
  setInterval(updateNextSandbox, 30000);
  
});
