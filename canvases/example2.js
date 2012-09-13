var jQuery = require('jquery');

var ctx = canvas.getContext('2d');
ctx.beginPath();
ctx.fillStyle = 'blue'
ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height / 4, 0, Math.PI * 2, true);
ctx.fill();

document.body.appendChild(canvas);
