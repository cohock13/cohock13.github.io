let easycam, param;
let boids = [];
let n;

// 刻み幅
let defaultFrameRate = 60;
let dt = 1 / defaultFrameRate;

function setup() {

    createCanvas(windowWidth, windowHeight, WEBGL);
    setAttributes("antialias", true);

    easycam = createEasyCam({ distance: windowWidth });
    console.log(Dw.EasyCam.INFO);

    param = {
      color: "rgb(27,232,100)",
      N: 150,
      size: 10,
      minSpeed: 300,
      maxSpeed: 500,
      cohesionCoefficient: 0.3,
      cohesionDistance: 500,
      cohesionAngle: 180,
      separationCoefficient: 1.0,
      separationDistance: 300,
      separationAngle: 120,
      alignmentCoefficient: 0.5,
      alignmentDistance: 200,
      alignmentAngle: 90,
      boundaryMode: "centerAttract", // "centerAttract" or "periodicBoundary"
      centerAttractCoefficient: 1.0,
      showAxes: true,
      showBoundary: true,
  
      Reset: function() {
        init();
      }
    };

    lilGUI();
    pixelDensity(1);
    angleMode(DEGREES);
    init();

  }
  
  function lilGUI() {

    const gui = new lil.GUI({autoplace: false});
  
    let displayFolder = gui.addFolder("Display");
    displayFolder.add(param, "showAxes").name("XYZ Axes");
    displayFolder.add(param, "showBoundary").name("Periodic Boundary");

    let boidsFolder = gui.addFolder("Model parameters");
    boidsFolder.addColor(param, "color").name("Body color");
    boidsFolder.add(param, "N", 5, 300, 10).name("Number of boids");
    boidsFolder.add(param,"size",3, 20, 1).name("Size of boids");
    boidsFolder.add(param, "maxSpeed", 100, 1000, 10).name("Max speed");
    boidsFolder.add(param, "minSpeed", 0, 500, 10).name("Min speed");
    boidsFolder.add(param, "boundaryMode", ["centerAttract","periodicBoundary"]);

    let cohesionFolder = boidsFolder.addFolder("Cohesion");
    cohesionFolder.add(param, "cohesionCoefficient", 0, 2, 0.1).name("Strength");
    cohesionFolder.add(param, "cohesionDistance", 0, 1000, 10).name("Distance");
    cohesionFolder.add(param, "cohesionAngle", 0, 180, 5).name("Angle");
  
    let separationFolder = boidsFolder.addFolder("Separation");
    separationFolder.add(param, "separationCoefficient", 0, 2, 0.1).name("Strength");
    separationFolder.add(param, "separationDistance", 0, 1000, 10).name("Distance");
    separationFolder.add(param, "separationAngle", 0, 180, 5).name("Angle");
  
    let alignmentFolder = boidsFolder.addFolder("Alignment");
    alignmentFolder.add(param, "alignmentCoefficient", 0, 1, 0.1).name("Strength");
    alignmentFolder.add(param, "alignmentDistance", 0, 1000, 10).name("Distance");
    alignmentFolder.add(param, "alignmentAngle", 0, 180, 5).name("Angle");

    let centerAttractFolder = boidsFolder.addFolder("CenterAttract");
    centerAttractFolder.add(param, "centerAttractCoefficient", 0, 1.5, 0.1).name("Strength");
  
    gui.add(param, "Reset");
    gui.open();

  }

function init() {
  n = param.N;
  boids = [];
  for (let i = 0; i < n; ++i) {
    boids[i] = new boid();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  easycam.setViewport([0, 0, windowWidth, windowHeight]);
}

function draw() {
  background(0);
  if (param.showAxes) {
    drawAxes();
  }
  drawBoids();
  updateBoids();
}

function drawAxes() {

  let lineLength = windowWidth/6;
  push();
  strokeWeight(5);

  stroke(255, 0, 0);
  line(0, 0, 0, lineLength, 0, 0);

  stroke(0, 255, 0); 
  line(0, 0, 0, 0, lineLength, 0);

  stroke(0, 0, 255);
  line(0, 0, 0, 0, 0, lineLength);
  pop();

  if (param.boundaryMode === "periodicBoundary" && param.showBoundary) {
    drawPeriodicBoundary();
  }

}

function drawPeriodicBoundary() {

  push();
  strokeWeight(6);
  noFill();
  
  // 立方体の外枠描画
  stroke(50); 
  let halfWidth = windowWidth/2;
  let halfHeight = windowWidth/2;
  let halfDepth = windowWidth/2;
  
  line(-halfWidth, -halfHeight, -halfDepth, halfWidth, -halfHeight, -halfDepth);
  line(halfWidth, -halfHeight, -halfDepth, halfWidth, -halfHeight, halfDepth);
  line(halfWidth, -halfHeight, halfDepth, -halfWidth, -halfHeight, halfDepth);
  line(-halfWidth, -halfHeight, halfDepth, -halfWidth, -halfHeight, -halfDepth);
  line(-halfWidth, halfHeight, -halfDepth, halfWidth, halfHeight, -halfDepth);
  line(halfWidth, halfHeight, -halfDepth, halfWidth, halfHeight, halfDepth);
  line(halfWidth, halfHeight, halfDepth, -halfWidth, halfHeight, halfDepth);
  line(-halfWidth, halfHeight, halfDepth, -halfWidth, halfHeight, -halfDepth);
  line(-halfWidth, -halfHeight, -halfDepth, -halfWidth, halfHeight, -halfDepth);
  line(halfWidth, -halfHeight, -halfDepth, halfWidth, halfHeight, -halfDepth);
  line(halfWidth, -halfHeight, halfDepth, halfWidth, halfHeight, halfDepth);
  line(-halfWidth, -halfHeight, halfDepth, -halfWidth, halfHeight, halfDepth);
  
  pop();

}

function drawBoids() {

  for (let boid of boids) {
    boid.drawBody();
  }

}

function updateBoids() {

  let boidsForceVector = Array(n).fill().map(() => createVector(0, 0, 0));

  for (let i = 0; i < n; ++i) {
    let pos1 = boids[i].pos;
    let vel1 = boids[i].vel;
    let cohesionForceVector = createVector(0, 0, 0);
    let separationForceVector = createVector(0, 0, 0);
    let alignmentForceVector = createVector(0, 0, 0);
    let cohesionCount = 0, separationCount = 0, alignmentCount = 0;

    for (let j = 0; j < n; ++j) {
      if (i !== j) {
        let pos2 = boids[j].pos;
        let vel2 = boids[j].vel;
        
        //let distance = pos1.dist(pos2);
        let distance = max(pos1.dist(pos2) - 2*param.size, 0.01);
        let angle = abs(vel1.angleBetween(p5.Vector.sub(pos2, pos1)));

        if (distance <= param.cohesionDistance && angle <= param.cohesionAngle) {
          cohesionForceVector.add(pos2);
          cohesionCount++;
        }
        if (distance <= param.separationDistance && angle <= param.separationAngle) {
          separationForceVector.add(p5.Vector.sub(pos1, pos2).mult(1 / distance));
          separationCount++;
        }
        if (distance <= param.alignmentDistance && angle <= param.alignmentAngle) {
          alignmentForceVector.add(vel2);
          alignmentCount++;
        }
      }
    }

    if (cohesionCount > 0) {
      cohesionForceVector.div(cohesionCount).sub(pos1).mult(param.cohesionCoefficient);
      boidsForceVector[i].add(cohesionForceVector);
    }

    if (separationCount > 0) {
      separationForceVector.mult(param.separationCoefficient);
      boidsForceVector[i].add(separationForceVector);
    }

    if (alignmentCount > 0) {
      alignmentForceVector.div(alignmentCount).sub(vel1).mult(param.alignmentCoefficient);
      boidsForceVector[i].add(alignmentForceVector);
    }

    if (param.boundaryMode === "centerAttract") {
      let attractSphereRadius = windowWidth / 4;
      let centerAttractForceVector = pos1.copy().mult(pos1.mag() - attractSphereRadius).mult(-3).div(pos1.mag());
      boidsForceVector[i].add(centerAttractForceVector);
    }
  }

  for (let i = 0; i < n; ++i) {
    boids[i].updatePosition(boidsForceVector[i]);
    boids[i].limitVelocity();
    if (param.boundaryMode === "periodicBoundary") {
      boids[i].applyPeriodicBoundary();
    }
  }
}


class boid {

  constructor() {
    let maxSpeed = param.maxSpeed;
    let initialMaxPosition = windowWidth;
    this.pos = createVector(random(-initialMaxPosition, initialMaxPosition),
                            random(-initialMaxPosition, initialMaxPosition),
                            random(-initialMaxPosition, initialMaxPosition));
    this.vel = createVector(random(-maxSpeed, maxSpeed), random(-maxSpeed, maxSpeed), random(-maxSpeed, maxSpeed));
  }

  updatePosition(forceVector) {
    this.vel.add(forceVector.mult(dt));
    this.pos.add(this.vel.copy().mult(dt));
  }

  limitVelocity() {
    if (this.vel.mag() < param.minSpeed) {
      this.vel.normalize();
      this.vel.mult(param.minSpeed);
    }
    if (this.vel.mag() > param.maxSpeed) {
      this.vel.normalize();
      this.vel.mult(param.maxSpeed);
    }
  }

  applyPeriodicBoundary() {
    if (this.pos.x > windowWidth / 2) this.pos.x -= windowWidth;
    if (this.pos.x < -windowWidth / 2) this.pos.x += windowWidth;
    if (this.pos.y > windowWidth / 2) this.pos.y -= windowWidth;
    if (this.pos.y < -windowWidth / 2) this.pos.y += windowWidth;
    if (this.pos.z > windowWidth / 2) this.pos.z -= windowWidth;
    if (this.pos.z < -windowWidth / 2) this.pos.z += windowWidth;
  }

  drawBody() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    fill(param.color);
    noStroke();
    let angleY = atan2(this.vel.x, this.vel.z) + 90;
    let angleZ = atan2(this.vel.y, this.vel.x) + 90;
    rotateZ(angleZ);
    rotateY(angleY);

    beginShape(TRIANGLES);
    vertex(0, -2*param.size, 0);
    vertex(-param.size, 2*param.size, 0);
    vertex(param.size, 2*param.size, 0);
    endShape();
    pop();
  }

}