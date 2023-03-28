var drawCanvas = document.getElementById("drawCanvas");
var drawContext = drawCanvas.getContext("2d");
var resultCanvas = document.getElementById("resultCanvas");
var resultContext = resultCanvas.getContext("2d");
var formImage = document.getElementById("formImage");

drawCanvas.addEventListener("mousemove", onMouseMove, false);

var mouseDown = false;

function setMouseDown(e) {
  var flags = e.buttons !== undefined ? e.buttons : e.which;
  mouseDown = (flags & 1) === 1;
}

function onMouseMove(e) {
  setMouseDown(e);
  e.stopPropagation();
  if (!mouseDown) return;
  var pos = getMousePos(drawCanvas, e);
  drawCircle(drawContext, pos.x, pos.y, 8);
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

function drawCircle(context, x, y, radius) {
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI, false);
  context.fillStyle = "black";
  context.fill();
}

function copyCanvasToFormImage() {
  formImage.value = drawCanvas.toDataURL();
}

function clearCanvases() {
  drawContext.clearRect(0, 0, drawCanvas.clientWidth, drawCanvas.height);
  resultContext.clearRect(0, 0, resultCanvas.clientWidth, resultCanvas.height);
}
