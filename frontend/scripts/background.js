var bg = document.getElementById("background");

function resizeBackground() {
  bg.style.height = window.innerHeight + 60;
}

window.addEventListener("resize", resizeBackground, true);

resizeBackground();
