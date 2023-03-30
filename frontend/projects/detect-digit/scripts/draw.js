var drawCanvas = document.getElementById("drawCanvas");
var drawContext = drawCanvas.getContext("2d");
var resultCanvas = document.getElementById("resultCanvas");
var resultContext = resultCanvas.getContext("2d");

var lastMouseX = 0;
var lastMouseY = 0;
var isMouseDown = false;

const CANVAS_BACKGROUND_FILL_STYLE = "white";
const DRAW_STROKE_STYLE = "black";
const DRAW_LINE_JOIN = "round";
const DRAW_LINE_WIDTH = 14;

// Handle MOUSE interactions

drawCanvas.addEventListener("mousedown", onMouseDown);
drawCanvas.addEventListener("mousemove", onMouseMove);
drawCanvas.addEventListener("mouseup", onMouseUp);

function onMouseDown(e) {
  isMouseDown = true;
  lastMouseX = e.offsetX;
  lastMouseY = e.offsetY;
}

function onMouseMove(e) {
  if (isMouseDown) {
    drawLine(drawContext, lastMouseX, lastMouseY, e.offsetX, e.offsetY);
    lastMouseX = e.offsetX;
    lastMouseY = e.offsetY;
  }
}

function onMouseUp(e) {
  if (isMouseDown) {
    isMouseDown = false;
    drawLine(drawContext, lastMouseX, lastMouseY, e.offsetX, e.offsetY);
    lastMouseX = 0;
    lastMouseY = 0;
  }
}

// Handle TOUCH interactions

var drawCanvasX; // Relative to viewport
var drawCanvasY; // Relative to viewport
var currentTouches = [];

drawCanvas.addEventListener("touchstart", onTouchStart);
drawCanvas.addEventListener("touchmove", onTouchMove);
drawCanvas.addEventListener("touchend", onTouchEnd);
drawCanvas.addEventListener("touchcancel", onTouchCancel);

function onTouchStart(e) {
  if (e.cancelable) e.preventDefault();

  drawCanvasX = drawCanvas.getBoundingClientRect().left;
  drawCanvasY = drawCanvas.getBoundingClientRect().top;

  for (let i = 0; i < e.changedTouches.length; i++) {
    currentTouches.push(copyTouch(e.changedTouches[i]));
  }
}

function onTouchMove(e) {
  if (e.cancelable) e.preventDefault();

  for (let i = 0; i < e.changedTouches.length; i++) {
    let touchIdx = currentTouchIndexById(
      currentTouches,
      e.changedTouches[i].identifier
    );

    if (touchIdx >= 0) {
      drawLine(
        drawContext,
        currentTouches[touchIdx].clientX - drawCanvasX,
        currentTouches[touchIdx].clientY - drawCanvasY,
        e.changedTouches[i].clientX - drawCanvasX,
        e.changedTouches[i].clientY - drawCanvasY
      );
      currentTouches.splice(touchIdx, 1, copyTouch(e.changedTouches[i])); // replace with latest touch
    }
  }
}

function onTouchEnd(e) {
  if (e.cancelable) e.preventDefault();

  for (let i = 0; i < e.changedTouches.length; i++) {
    let touchIdx = currentTouchIndexById(
      currentTouches,
      e.changedTouches[i].identifier
    );

    if (touchIdx >= 0) {
      currentTouches.splice(touchIdx, 1);
    }
  }
}

function onTouchCancel(e) {
  onTouchEnd(e);
}

function copyTouch({ identifier, clientX, clientY }) {
  return { identifier, clientX, clientY };
}

function currentTouchIndexById(currentTouches, idToFind) {
  for (let i = 0; i < currentTouches.length; i++) {
    const id = currentTouches[i].identifier;

    if (id === idToFind) {
      return i;
    }
  }
  return -1; // id not found
}

// Helper functions for manipulating canvases

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

// Helper functions for interacting with API

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
