$(document).ready(function() {

  var myCodeMirror = CodeMirror.fromTextArea($('.editor')[0], {
    mode:  "javascript",
    theme: "monokai",
    lineNumbers: true,
    onKeyEvent : function (editor, e) {
      myCodeMirror.save();
      reloadLiveView($('.editor').val());
    }
  });

  var id = window.location.pathname.split('/')[2];
  var viewUrl = "/canvas/" + id + "/view";
  var srcUrl = "/get/" + id + ".js.tmp?clean=1";

  jQuery.ajax({
    url: srcUrl,
    success: function(response) {
      if(response) {
        myCodeMirror.setValue(response);
      }
    },
    error: function() {
      jQuery.get('/get/default_example.js?clean=1', function(response) {
        myCodeMirror.setValue(response);
      });
    }
  });

  // Load the current view in the right half.
  $("<iframe src='" + viewUrl + "' class='canvas-iframe' />").load(function() {
    myCodeMirror.save();
    reloadLiveView($('.editor').val());
  }).appendTo('.editor-canvas');

  // Save the codes on the server.
  $('.save-code').click(function(event) {

    myCodeMirror.save();
    $.ajax({
      url: '/canvas/' + id + '/save',
      type: 'POST',
      data: {content: $('.editor').val(), publish: true}
    });
  });
});


function reloadLiveView(script) {
  try {
    // Get the script processed to use.
    var string = script.toString('utf-8');
    var requires = [];

    string.replace(/require\((.*?)\)/g, function (_, file) {
      requires.push(file);
    });
    string = 'require([' + requires.join(', ') + '], function () {\n' + string + '\n});';

    // Clear the iFrame and inject it with the 'string' which is the script.
    $('.editor-canvas iframe').contents().find('body').html('');
    $('.editor-canvas iframe')[0].contentWindow.eval(string);

    // Also, save this script to the server
    var id = window.location.pathname.split('/')[2];
    $.ajax({
      url: '/canvas/' + id + '/save',
      type: 'POST',
      data: {content: $('.editor').val()} //unmodified script
    });
  }
  catch (ex) {
  }
}
