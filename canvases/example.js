//canvas.ready(function () {
  var canvas = document.createElement('canvas');
  canvas.width = document.width;
  canvas.height = document.height;

  var ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.fillStyle = 'red'
  ctx.arc(canvas.width, canvas.height, canvas.height / 2, 0, Math.PI, true);
  ctx.fill();

  document.body.appendChild(canvas);
//});
