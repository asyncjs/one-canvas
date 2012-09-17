var socket = io.connect("http://onecanvas.asyncjs.com");

$(function () {
  var info = {
    x: $('.canvas').outerWidth(),
    y: $('.canvas').outerHeight()
  };

  var parts = window.location.pathname.split("/");
  var src = parts[parts.length-1];

  var cursors = [$('.cursor')];
  //pregenerate cursors
  for (var i = 0; i < 6; i += 1) {
    cursors.push(cursors[0].clone().appendTo($('.canvas')));
  }

  $('.canvas').on("mouseup touchend", function() {
    this.pdown = false;
    //TODO: make this only hide finger ups
    $('.cursor').hide();
  });

  $('.canvas').on("touchstart touchmove mousemove mousedown", function(e) {
    var pos = [];
    e.preventDefault();
    if(e.type === 'mousedown') this.pdown = true;
    if(e.type.match(/^touch/) || this.pdown) {
      if(e.originalEvent.touches) {
        $.each(e.originalEvent.touches, function(cnt, touch) {
          pos.push({ x: touch.pageX, y: touch.pageY});
        });
      } else {
        pos =[{ x: e.pageX - this.offsetLeft, y: e.pageY - this.offsetTop }];
      }
      $.each(pos, function(cnt, curpos) {
        cursor = cursors[cnt];
        cursor.show().css({left: curpos.x - 25, top: curpos.y - 25});
      });
      
      socket.emit('paint', src, { t: pos, s: info });
    }
  });
});
