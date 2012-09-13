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
  var srcUrl = "/get/" + id + ".js.tmp";

  jQuery.ajax({
    url: srcUrl,
    success: function(response) {
      if(response) {
        myCodeMirror.setValue(response);
      }
    },
    error: function() {
      jQuery.get('/get/default_example.js', function(response) {
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
    $script = $('.editor-canvas iframe').contents().find('#canvasScript');

    $('.editor-canvas iframe').contents().find('body').html('');
    $('.editor-canvas iframe')[0].contentWindow.eval(script);

    // Also, save this.
    var id = window.location.pathname.split('/')[2];
    $.ajax({
      url: '/canvas/' + id + '/save',
      type: 'POST',
      data: {content: $('.editor').val()}
    });
  }
  catch (ex) {
  }
}
