const sk = (rayCount) => (sketch) => {
  let walls = [];
  //let ray;
  let particles = [];

  let sketchWindowRatio = 0.5;

  sketch.setup = () => {
    let canvas = sketch.createCanvas(100, 100);
    sketch.windowResized();
    let canvas_dom = document.getElementById(canvas.canvas.id)
    canvas_dom.addEventListener("touchstart",  function(event) {event.preventDefault()}, { passive: false})
    canvas_dom.addEventListener("touchmove",   function(event) {event.preventDefault()}, { passive: false})
    canvas_dom.addEventListener("touchend",    function(event) {event.preventDefault()}, { passive: false})
    canvas_dom.addEventListener("touchcancel", function(event) {event.preventDefault()}, { passive: false})

    sketch.makeWallsAndParticles();
  };

  sketch.draw = () => {
    sketch.background(0);

    for (let particle of particles) {
      particle.update();
      particle.show();
      particle.look(walls);
    }

    for (let wall of walls) {
      wall.show();
    }
  };

  sketch.mousePressed = () => {
    if (sketch.mouseButton == sketch.LEFT) {
      for (let particle of particles) {
        particle.checkHeld();
      }
    } else if (sketch.mouseButton == sketch.CENTER) {
      particles.push(
        new Particle(sketch.mouseX, sketch.mouseY, rayCount, sketch)
      );
    }
  };

  sketch.mouseReleased = () => {
    for (let particle of particles) {
      particle.setHeld(false);
    }
  };

  // Handle touchscreen press
  sketch.touchStarted = () => {
    for (let particle of particles) {
      particle.checkHeld();
    }
  }

  // Handle touchscreen release
  sketch.touchEnded = () => {
    for (let particle of particles) {
      particle.setHeld(false);
    }
  }

  sketch.makeWallsAndParticles = () => {
    width = sketch.width;
    height = sketch.height;

    walls = [];
    particles = [];

    walls.push(new Boundary(width/4, width/4, 3/4*width, width/4, sketch));
    walls.push(new Boundary(width/4, 3/4*width, 3/4*width, 3/4*width, sketch));

    walls.push(new Boundary(width/5, width/4, width/5, 3/4*width, sketch));
    walls.push(new Boundary(4/5*width, width/4, 4/5*width, 3/4*width, sketch));

    walls.push(new Boundary(0, 0, width, 0, sketch));
    walls.push(new Boundary(0, 0, 0, height, sketch));
    walls.push(new Boundary(width, 0, width, height, sketch));
    walls.push(new Boundary(0, height, width, height, sketch));

    particles.push(new Particle(2/5*width, 52/100*height, rayCount, sketch));
  }

  sketch.windowResized = () => {
    width = Math.min(window.innerWidth, window.innerHeight)*sketchWindowRatio;
    height = width;

    sketch.resizeCanvas(width, height);

    sketch.makeWallsAndParticles();
  }

};

const rayCount1 = 20;
const rayCount2 = 360;

let p5Sketch1 = new p5(sk(rayCount1), "raycastingSketch1");
let p5Sketch2 = new p5(sk(rayCount2), "raycastingSketch2");
