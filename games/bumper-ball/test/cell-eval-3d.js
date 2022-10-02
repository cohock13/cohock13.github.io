
let dt = 1/60; // 1/frameRate();
let t = 0;

let leftCanvas;
let rightCanvas;
let canvasWidth,canvasHeight;

function parameters() {

	this.leftMode = "Simple Force";
	this.rightMode = "Random";

	this.reset = function() {
		init();
	}
}

function setup() {

	createCanvas(windowWidth,windowHeight);
	leftCanvas = createGraphics(canvasWidth,canvasHeight);
	rightCanvas = createGraphics(canvasWidth,canvasHeight);

	canvasWidth = 0.4*windowWidth
	canvasHeight = windowHeight;

	param = new parameters();

	background(0);
	init();
	colorMode(RGB);

   // ---------- GUI ----------- //

	let gui = new dat.GUI();

	let cellMovementModeGUI = gui.addFolder("Mode");
	cellMovementModeGUI.add(param,"leftMode",["Simple Force","Position Fixed","Random"]).name("Left");
	cellMovementModeGUI.add(param,"rightMode",["Simple Force","Position Fixed","Random"]).name("Right");
	cellMovementModeGUI.open();

	gui.add(param,"reset").name("Reset");

}



function draw() {

	t += dt;

	drawleftCanvas();
	drawRightCanvas();

	image(leftCanvas,0,0);
	image(rightCanvas,centerLine,0);

    // draw somethings

}

function drawleftCanvas(){
	leftCanvas.background(200,200,200);
	leftCanvas.textSize(30);
	leftCanvas.text("Left",canvasWidth/2,canvasHeight/2);
}

function drawRightCanvas(){
	rightCanvas.background(50,50,50);
	rightCanvas.textSize(30);
	rightCanvas.text("Right",canvasWidth/2,canvasHeight/2);
}

function init() {

}

function calcEvaluationScores(){


}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight-7);
}



