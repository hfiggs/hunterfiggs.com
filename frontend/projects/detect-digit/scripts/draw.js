var drawCanvas = document.getElementById("drawCanvas");
var drawContext = drawCanvas.getContext("2d");
var resultCanvas = document.getElementById("resultCanvas");
var resultContext = resultCanvas.getContext("2d");

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
  drawCircle(drawContext, pos.x, pos.y, 12);
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

function sumbitCanvasImage() {
  var formData = new FormData();
  var file = dataURLtoFile(drawCanvas.toDataURL("image/png"), "number.png");
  formData.append("file", file, 'number.png');
  
  var request = new XMLHttpRequest();

  if (window.location.hostname === "localhost") {
    request.open("POST", "//localhost:80/predict-digit/");
  } else {
    request.open("POST", "//api.hunterfiggs.com/predict-digit/");
  }

  request.send(formData);
}

function clearCanvases() {
  drawContext.fillStyle = "white";
  drawContext.fillRect(0, 0, drawCanvas.clientWidth, drawCanvas.height);
  resultContext.fillStyle = "white";
  resultContext.clearRect(0, 0, resultCanvas.clientWidth, resultCanvas.height);
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
