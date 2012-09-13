(function () {
function injectScripts(iframe, src_list, callback) {
  // Inject code into the sandbox
  var script = document.createElement('script');
  script.src = src_list.shift(); 
  iframe[0].contentDocument.body.appendChild(script);
  script.onload = function () {
    if (src_list.length == 0) {
      if (callback) {
        callback();
      }
    } else {
      injectScripts(iframe, src_list, callback);
    }
  };
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

// Creates a sandbox iframe for a given script, injects everything and
// returns the jQuery object representing it.
window.setupSandboxIFrame = function (iframe, id, src) {
    iframe[0].contentWindow.Broadcast = window.Broadcast;
    injectCSS(iframe, "/css/screen.css", function () {
      injectScripts(iframe, [ "/socket.io/socket.io.js",
                              "/js/vendor/broadcast.js",
                              "/js/vendor/require.js",
                              "/js/module.js"],
                    function () {
                      iframe[0].contentWindow.createModule(id);
                      injectScripts(iframe, [src + "?" + Math.random()]);
                    });
    });
}
  
})();
