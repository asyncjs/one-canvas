$(document).ready(function() {
  var myCodeMirror = CodeMirror.fromTextArea($('.editor')[0], {
    mode:  "javascript",
    theme: "monokai",
    lineNumbers: true
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
      data: {content: $('.editor').val()},
      success: function(response) {
        $('.try-code').click();
        reloadLiveView();
      }
    });
  });

  // Refresh the right half.
  $('.try-code').click(function(event) {
    reloadLiveView();
  });
});


function reloadLiveView() {
  $('.canvas-iframe')[0].contentWindow.location.reload(true);
}
