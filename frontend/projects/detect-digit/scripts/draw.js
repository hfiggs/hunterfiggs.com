var drawCanvas = document.getElementById("drawCanvas");
var drawContext = drawCanvas.getContext("2d");
var resultCanvas = document.getElementById("resultCanvas");
var resultContext = resultCanvas.getContext("2d");

var lastMouseX = 0;
var lastMouseY = 0;
var isMouseDown = false;
var isDrawing = false;

const CANVAS_BACKGROUND_FILL_STYLE = "white";
const CANVAS_TEXT_FONT_RESULT = "150px Courier New";
const CANVAS_TEXT_FONT_MESSAGE = "16px Courier New";
const CANVAS_TEXT_FILL_STYLE_PRIMARY = "black";
const CANVAS_TEXT_FILL_STYLE_SECONDARY = "gray";
const CANVAS_TEXT_ALIGN = "center";
const CANVAS_TEXT_BASELINE = "middle";
const DRAW_STROKE_STYLE = "black";
const DRAW_LINE_JOIN = "round";
const DRAW_LINE_WIDTH = 14;

// Handle MOUSE interactions

drawCanvas.addEventListener("mousedown", onMouseDown);
drawCanvas.addEventListener("mousemove", onMouseMove);
drawCanvas.addEventListener("mouseup", onMouseUp);

setupCanvases();

function onMouseDown(e) {
  if (!isDrawing) {
    isDrawing = true;
    clearCanvas(drawContext, drawCanvas);
  }
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

/*
Touch handling code adapted from MDN web docs example:
https://developer.mozilla.org/en-US/docs/Web/API/Touch_events#example

According to the following page, code samples added after 2010/08/20
are in the public domain:
https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Attrib_copyright_license#code_samples
*/

var drawCanvasX; // Relative to viewport
var drawCanvasY; // Relative to viewport
var currentTouches = [];

drawCanvas.addEventListener("touchstart", onTouchStart);
drawCanvas.addEventListener("touchmove", onTouchMove);
drawCanvas.addEventListener("touchend", onTouchEnd);
drawCanvas.addEventListener("touchcancel", onTouchCancel);

function onTouchStart(e) {
  if (e.cancelable) e.preventDefault();

  if (!isDrawing) {
    isDrawing = true;
    clearCanvas(drawContext, drawCanvas);
  }

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

function setupCanvases() {
  clearCanvases();

  drawCenteredText(drawContext, drawCanvas, CANVAS_TEXT_FONT_MESSAGE, CANVAS_TEXT_FILL_STYLE_SECONDARY, "Draw a digit 0-9\nand press Detect!");
  drawCenteredText(resultContext, resultCanvas, CANVAS_TEXT_FONT_MESSAGE, CANVAS_TEXT_FILL_STYLE_SECONDARY, "The detected digit\nwill appear here.");
}

function clearCanvases() {
  isDrawing = false;
  clearCanvas(drawContext, drawCanvas);
  clearCanvas(resultContext, resultCanvas);
}

function clearCanvas(context, canvas) {
  context.fillStyle = CANVAS_BACKGROUND_FILL_STYLE;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawCenteredText(context, canvas, font, fillStyle, text) {
  context.font = font;
  context.fillStyle = fillStyle;
  context.textAlign = CANVAS_TEXT_ALIGN;
  context.textBaseline = CANVAS_TEXT_BASELINE;

  let lines = splitStringNewline(text);
  let lineHeight = Number(font.split("px")[0]);

  for (let i = 0; i < lines.length; i++) {
    context.fillText(lines[i], canvas.width/2, canvas.height/2 + i*lineHeight);
  }
}

function drawResult(response) {
  if (!Object.hasOwn(response, "probs")) {
    console.error("Response is missing key 'probs'");
    return;
  }

  let probs = response["probs"];

  let maxProb = 0;
  let maxProbDigitStr = "";

  for (let i = 0; i <= 9; i++) {
    if (!Object.hasOwn(probs, i.toString())) {
      console.error("Response is missing key '" + i + "'");
      return;
    }

    let currProb = probs[i.toString()];

    if (currProb > maxProb) {
      maxProb = currProb;
      maxProbDigitStr = i.toString();
    }
  }

  if (maxProbDigitStr === "") {
    console.error("Response probabilities are all 0");
    return;
  }

  clearCanvas(resultContext, resultCanvas);
  resultContext.font = CANVAS_TEXT_FONT_RESULT;
  resultContext.fillStyle = CANVAS_TEXT_FILL_STYLE_PRIMARY;
  resultContext.textAlign = CANVAS_TEXT_ALIGN;
  resultContext.textBaseline = CANVAS_TEXT_BASELINE;
  resultContext.fillText(maxProbDigitStr, resultCanvas.width/2, resultCanvas.height/2);
}

function splitStringNewline(string) {
  return string.split(/\r?\n/)
}

// Helper functions for interacting with API

function sumbitCanvasImage() {
  var formData = new FormData();
  var file = dataURLtoFile(drawCanvas.toDataURL("image/png"), "number.png");
  formData.append("file", file, "number.png");

  var request = new XMLHttpRequest();

  if (window.location.hostname === "localhost") {
    request.open("POST", "//localhost:80/predict-digit/", true);
  } else {
    request.open("POST", "//api.hunterfiggs.com/predict-digit/", true);
  }

  request.responseType = "json";

  request.onreadystatechange = () => {
    if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
      drawResult(request.response);
    }
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
