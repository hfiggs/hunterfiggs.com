const sk = (rayCount) => (sketch) => {
  let walls = [];
  //let ray;
  let particles = [];

  let width;
  let height;

  sketch.setup = () => {
    sketch.createCanvas(400, 400);

    width = sketch.width;
    height = sketch.height;

    for (let i = 0; i < 5; i++) {
      let x1 = sketch.random(width);
      let y1 = sketch.random(height);
      let x2 = sketch.random(width);
      let y2 = sketch.random(height);

      walls[i] = new Boundary(x1, y1, x2, y2, sketch);
    }

    walls.push(new Boundary(0, 0, width, 0, sketch));
    walls.push(new Boundary(0, 0, 0, height, sketch));
    walls.push(new Boundary(width, 0, width, height, sketch));
    walls.push(new Boundary(0, height, width, height, sketch));

    particles.push(new Particle(width / 2, width / 2, rayCount, sketch));
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
};

const rayCount1 = 20;
const rayCount2 = 360;

let p5Sketch1 = new p5(sk(rayCount1), "raycastingSketch1");
let p5Sketch2 = new p5(sk(rayCount2), "raycastingSketch2");
