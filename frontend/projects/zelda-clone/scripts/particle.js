class Particle {
  constructor(x, y, rayCount, s) {
    this.sketch = s;
    this.pos = this.sketch.createVector(x, y);
    this.rays = [];
    for (let a = 0; a < rayCount; a += 1) {
      this.rays.push(
        new Ray(
          this.pos,
          this.sketch.radians((a / rayCount) * 360),
          this.sketch
        )
      );
    }

    this.held = false;
  }

  checkHeld() {
    if (
      this.sketch.abs(this.pos.x - this.sketch.mouseX) < 15 &&
      this.sketch.abs(this.pos.y - this.sketch.mouseY) < 15
    ) {
      this.held = true;
    } else {
      this.held = false;
    }
  }

  setHeld(bool) {
    this.held = bool;
  }

  update() {
    if (this.held) {
      this.pos.x = this.sketch.mouseX;
      this.pos.y = this.sketch.mouseY;

      // Prevent particle from leaving canvas
      if (this.pos.x < 15)
      {
        this.pos.x = 15;
      }
      else if (this.pos.x > (this.sketch.width - 15))
      {
        this.pos.x = this.sketch.width - 15;
      }

      if (this.pos.y < 15)
      {
        this.pos.y = 15;
      }
      else if (this.pos.y > (this.sketch.height - 15))
      {
        this.pos.y = this.sketch.height - 15;
      }
    }
  }

  look(walls) {
    for (let ray of this.rays) {
      let closest = null;
      let record = Infinity;
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          let d = p5.Vector.dist(this.pos, pt);
          d = this.sketch.min(d, record);
          if (d < record) {
            record = d;
            closest = pt;
          }
        }
      }
      if (closest) {
        this.sketch.stroke(255, 100);
        this.sketch.line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
  }

  show() {
    this.sketch.fill(255);
    this.sketch.ellipse(this.pos.x, this.pos.y, 16);
    for (let ray of this.rays) {
      ray.show();
    }
  }
}
