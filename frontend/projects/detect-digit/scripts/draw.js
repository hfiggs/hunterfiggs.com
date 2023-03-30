var drawCanvas = document.getElementById("drawCanvas");
var drawContext = drawCanvas.getContext("2d");
var resultCanvas = document.getElementById("resultCanvas");
var resultContext = resultCanvas.getContext("2d");

var x = 0;
var y = 0;
var offsetX;
var offsetY;
var isMouseDown = false;

const CANVAS_BACKGROUND_FILL_STYLE = "white";
const DRAW_STROKE_STYLE = "black";
const DRAW_LINE_JOIN = "round"
const DRAW_LINE_WIDTH = 14;

drawCanvas.addEventListener("mousedown", onMouseDown);
drawCanvas.addEventListener("mousemove", onMouseMove);
drawCanvas.addEventListener("mouseup", onMouseUp);

function onMouseDown(e) {
  isMouseDown = true;
  x = e.offsetX;
  y = e.offsetY;
}

function onMouseMove(e) {
  if (isMouseDown) {
    drawLine(drawContext, x, y, e.offsetX, e.offsetY);
    x = e.offsetX;
    y = e.offsetY;
  }
}

function onMouseUp(e) {
  if (isMouseDown) {
    isMouseDown = false;
    drawLine(drawContext, x, y, e.offsetX, e.offsetY);
    x = 0;
    y = 0;
  }
}

function drawLine(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = DRAW_STROKE_STYLE;
  context.lineWidth = DRAW_LINE_WIDTH;
  context.lineJoin = DRAW_LINE_JOIN;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.closePath();
  context.stroke();
}

function clearCanvases() {
  drawContext.fillStyle = CANVAS_BACKGROUND_FILL_STYLE;
  drawContext.fillRect(0, 0, drawCanvas.clientWidth, drawCanvas.height);
  resultContext.fillStyle = CANVAS_BACKGROUND_FILL_STYLE;
  resultContext.clearRect(0, 0, resultCanvas.clientWidth, resultCanvas.height);
}

function sumbitCanvasImage() {
  var formData = new FormData();
  var file = dataURLtoFile(drawCanvas.toDataURL("image/png"), "number.png");
  formData.append("file", file, "number.png");

  var request = new XMLHttpRequest();

  if (window.location.hostname === "localhost") {
    request.open("POST", "//localhost:80/predict-digit/");
  } else {
    request.open("POST", "//api.hunterfiggs.com/predict-digit/");
  }

  request.send(formData);
}

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

clearCanvases();
