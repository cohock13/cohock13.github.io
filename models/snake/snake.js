
function setup() {
	createCanvas(windowWidth,windowHeight);
	strokeWeight(3);
	colorMode(HSB);
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
  }
function draw() {
	background(0);
	textSize(30);
	strokeWeight(2);
	textFont("Comic Sans MS");
	fill(255);
	noStroke();
	text("ヘビ(曲率微分制御)",windowWidth*0.03,windowHeight*0.08);
}