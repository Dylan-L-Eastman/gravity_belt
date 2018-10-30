(function () {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  initialize();

  function initialize() {
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
  }

  function redraw() {
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = '5';
    ctx.strokeRect(0, 0, window.innerWidth, window.innerHeight);
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redraw();
  }
})();
