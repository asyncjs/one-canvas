$(document).ready(function() {
  var myCodeMirror = CodeMirror.fromTextArea($('.editor')[0], {
    value: "function myScript(){return 100;}\n",
    mode:  "javascript",
    theme: "monokai",
    lineNumbers: true
  });


  $('.save-code').click(function(event) {

    myCodeMirror.save();
    var content = $('.editor').val();
    $.ajax({
      url: '/canvas' + id + '/save',
      type: 'POST',
      data: {content: content},
      success: function(response) {
        console.log('back!');
      }
    });
  });
});
