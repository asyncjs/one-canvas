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

  //TODO: fix this - this will break anytime soon!
  var id = window.location.pathname.split('/')[2];
  var viewUrl = "/canvas/" + id + "/view";

  // Load the current view in the right half.
  $("<iframe src='" + viewUrl + "' class='canvas-iframe' />").load(function() {
    // add something here if needed
  }).appendTo('.editor-canvas');

  // Save the codes on the server.
  $('.save-code').click(function(event) {

    myCodeMirror.save();

    $.ajax({
      url: '/canvas/' + id + '/save',
      type: 'POST',
      data: {content: $('.editor').val(), publish: true},
      success: function(response) {
        //$('.try-code').click();
      }
    });
  });
});


function reloadLiveView(script) {
  $script = $('.editor-canvas iframe').contents().find('#canvasScript');

  $('.editor-canvas iframe').contents().find('body').html('');
  $('.editor-canvas iframe')[0].contentWindow.eval(script);
}
