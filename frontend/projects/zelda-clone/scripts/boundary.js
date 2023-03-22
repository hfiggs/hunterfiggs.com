class Boundary {
  constructor(x1, y1, x2, y2, s) {
    this.sketch = s;
    this.a = this.sketch.createVector(x1, y1);
    this.b = this.sketch.createVector(x2, y2);
  }

  show() {
    this.sketch.stroke(255);
    this.sketch.line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}
