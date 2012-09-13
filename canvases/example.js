var jQuery = require('jquery');

var ctx = canvas.getContext('2d');
ctx.beginPath();
var genCol = function() {
  return Math.floor(Math.random()*16).toString(16);
};
ctx.fillStyle = '#' + genCol() + genCol() + genCol();
ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height / 4, 0, Math.PI * 2, true);
ctx.fill();

module.send("test");
module.message(function(msg) {
  console.log("GOT MESSAGE", msg);
});

