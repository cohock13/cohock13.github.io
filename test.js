let numParticles = 100;

let particlePos = [];
let particleVel = [];

function setup() {
	createCanvas(windowWidth,windowHeight);

	reset();
	strokeWeight(3);
	colorMode(HSB);
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
  }
function draw() {
	background(0);
	for (let i = 0; i < numParticles; i++) {
		for (let j = 0; j < numParticles; j++) {
			if (j != i) particleVel[i].add(attract(j, particlePos[i].x, particlePos[i].y));
		}
		particleVel[i].add(centerAttract(particlePos[i].x, particlePos[i].y));

		particlePos[i].add(particleVel[i]);
		particleVel[i].mult(0.999);

		stroke((frameCount + (i / numParticles) * 50) % 255, 255, 255);
		line(particlePos[i].x, particlePos[i].y, particlePos[i].x - particleVel[i].x, particlePos[i].y - particleVel[i].y);
	}
}

function attract(attractIndex, posX, posY) {
	let attractionForce = createVector(posX - particlePos[attractIndex].x, posY - particlePos[attractIndex].y);
	attractionForce.normalize();

	let amp = 1 / sqrt(dist(posX, posY, particlePos[attractIndex].x, particlePos[attractIndex].y));
	amp /= numParticles
	attractionForce.mult(-2 * amp);

	return attractionForce;
}

function centerAttract(posX, posY) {
	let attractionForce = createVector(posX - width / 2, posY - height / 2);
	attractionForce.normalize();
	let amp = 1 / sqrt(dist(posX, posY, width / 2, height / 2));
	attractionForce.mult(-4 * amp);
	return attractionForce;
}

function reset() {
	background(0);

	for (let i = 0; i < numParticles; i++) {
		particlePos[i] = createVector(random(width), random(height));
		particleVel[i] = createVector(0, 0);
	}
}

function keyPressed() {
	if (keyCode == LEFT_ARROW) numParticles -= ceil(sqrt(numParticles));
	if (keyCode == RIGHT_ARROW) numParticles += ceil(sqrt(numParticles));

	numParticles = constrain(numParticles, 1, 1000);
	reset();
}