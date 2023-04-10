pathfinding = (function () {
  // html board
  var board = $("#board")[0];
  var boardChanged = false;

  // state vars
  var lastMouseEnterId = null;
  var shouldDrawPath = true;

  // board dimensions
  var cols = 50;
  var rows = 25;

  // board data
  var boardData = new Array(rows);
  for (let i = 0; i < rows; i++) {
    boardData[i] = new Array(cols);
  }

  // worker to handle background path-finding
  var worker = new Worker("./scripts/graph.js");

  // var to keep track of state of mouse
  var mouseDown = false;

  $(document).ready(function () {
    $(document).mousedown(function () {
      mouseDown = true;
    });

    $(document).mouseup(function () {
      mouseDown = false;
      if (boardChanged) {
        boardChanged = false;
        triggerPathFind();
      }
    });

    $("td").mousedown(function () {
      mouseDown = true;

      if ($(this).hasClass("start") || $(this).hasClass("finish")) {
        // do nothing (for now)
      } else {
        stopPathFind();
        if ($(this).hasClass("wall")) {
          $(this).removeClass("wall");
          $(this).addClass("unseen");
        } else {
          $(this).removeClass();
          $(this).addClass("wall");
        }
        boardChanged = true;
      }
    });

    $("td").mouseup(function () {
      mouseDown = false;
      if (boardChanged) {
        boardChanged = false;
        triggerPathFind();
      }
    });

    $("td").mouseenter(function () {
      if (lastMouseEnterId !== $(this).attr("id")) {
        lastMouseEnterId = $(this).attr("id");
        if (mouseDown) {
          if ($(this).hasClass("start") || $(this).hasClass("finish")) {
            // do nothing (for now)
          } else {
            stopPathFind();
            if ($(this).hasClass("wall")) {
              $(this).removeClass("wall");
              $(this).addClass("unseen");
            } else {
              $(this).removeClass();
              $(this).addClass("wall");
            }
            boardChanged = true;
          }
        }
      }
    });

    triggerPathFind();
  });

  function stopPathFind() {
    shouldDrawPath = false;
    // If browser supports workers
    if (window.Worker) {
      worker.terminate();
    }
  }

  function triggerPathFind() {
    // If browser supports workers
    if (window.Worker) {
      // Stop and recreate worker
      worker.terminate();
      worker = new Worker("./scripts/graph.js");

      // start/finish coords
      let startId, finishId;

      // populate board data
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          let cellId = "#" + i + "-" + j;

          if ($(cellId).hasClass("seen") || $(cellId).hasClass("path")) {
            $(cellId).removeClass();
            $(cellId).addClass("unseen");
          }

          boardData[i][j] = $(cellId).attr("class") != "wall";

          switch ($(cellId).attr("class")) {
            case "start":
              startId = cellId.split("#")[1];
              break;
            case "finish":
              finishId = cellId.split("#")[1];
              break;
          }
        }
      }

      worker.postMessage([boardData, startId, finishId]);
    }

    worker.onmessage = function (e) {
      switch (e.data[0]) {
        // no path
        case 0:
          worker.terminate();
          break;
        // update nodes
        case 1:
          updateCell(e.data[1]);
          break;
        // finished
        case 2:
          worker.terminate();
          shouldDrawPath = true;
          drawPath(e.data[1]);
          break;
        default:
          worker.terminate();
          break;
      }
    };
  }

  // function sleep(milliseconds) {
  //     const date = Date.now();
  //     let currentDate = null;
  //     do {
  //       currentDate = Date.now();
  //     } while (currentDate - date < milliseconds);
  // }

  function updateCell(cellNum) {
    let r = Math.floor(cellNum / cols);
    let c = cellNum % cols;
    let cellId = r + "-" + c;
    if (cellId != startCell.attr("id") && cellId != finishCell.attr("id")) {
      $("#" + cellId).removeClass();
      $("#" + cellId).addClass("seen");
    }
  }

  function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

  function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

  async function drawPath(parent) {
    let startNode =
      startCell.attr("id").split("-")[0] * cols +
      startCell.attr("id").split("-")[1] * 1;
    let finishNode =
      finishCell.attr("id").split("-")[0] * cols +
      finishCell.attr("id").split("-")[1] * 1;

    let cellNum = parent[finishNode];

    while (parent[cellNum] != -1 && shouldDrawPath) {
      let r = Math.floor(cellNum / cols);
      let c = cellNum % cols;
      let cellId = r + "-" + c;
      $("#" + cellId).removeClass();
      $("#" + cellId).addClass("path");
      cellNum = parent[cellNum];
      await new Promise((r) => setTimeout(r, 30));
    }
  }

  //////////////////////////////
  //  Execution starts here   //
  //////////////////////////////

  // game board html window dimensions
  var width = 80;
  var height = Math.ceil((rows / cols) * width);

  // generate game board html
  board.style.width = width + "vw";
  board.style.height = height + "vw";
  for (let r = 0; r < rows; r++) {
    let row = board.appendChild(document.createElement("tr"));

    for (let c = 0; c < cols; c++) {
      let id = (row.appendChild(document.createElement("td")).id = r + "-" + c);
      let cell = $("#" + id);
      cell.css("height", Math.floor((1 / rows) * height) + "vw");
      cell.css("width", Math.floor((1 / cols) * width) + "vw");
      cell.addClass("unseen");
    }
  }

  var offset = Math.min(Math.floor(rows / 8), Math.floor(cols / 8));

  // setup start/finish nodes
  var startCell = $("#" + offset + "-" + offset);
  startCell.removeClass();
  startCell.addClass("start");

  var finishCell = $("#" + (rows - offset - 1) + "-" + (cols - offset - 1));
  finishCell.removeClass();
  finishCell.addClass("finish");
})();
