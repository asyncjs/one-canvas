var jQuery = require('jquery');

var ctx = canvas.getContext('2d');
ctx.beginPath();
ctx.fillStyle = '#' + Math.floor(Math.random()*16).toString(16) + Math.floor(Math.random()*16).toString(16) + Math.floor(Math.random()*16).toString(16);
ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height / 4, 0, Math.PI * 2, true);
ctx.fill();
