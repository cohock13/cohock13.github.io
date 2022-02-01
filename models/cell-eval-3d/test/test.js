let leftBuffer;
let rightBuffer;

let param,easycam;

let canvasWidth,canvasHeight;

function parameters() {

	this.leftMode = "Simple Force";
	this.rightMode = "Random";

	this.reset = function() {
		init();
	}

}

function setup(){

    createCanvas(windowWidth,windowHeight,WEBGL);
    setAttributes("antialias",true);

	createEasyCam

    canvasWidth = 0.43*windowWidth;
	canvasHeight = windowHeight;

    leftBuffer = createGraphics(canvasWidth,canvasHeight);
    rightBuffer = createGraphics(canvasWidth,canvasHeight);

    param = new parameters();
    // gui settings 

    let gui = new dat.GUI();

	let cellMovementModeGUI = gui.addFolder("Mode");
	cellMovementModeGUI.add(param,"leftMode",["Simple Force","Position Fixed","Random"]).name("Left");
	cellMovementModeGUI.add(param,"rightMode",["Simple Force","Position Fixed","Random"]).name("Right");
	cellMovementModeGUI.open();

	gui.add(param,"reset").name("Reset");

}

function draw() {

	background(50);
    drawLeftBuffer();
    drawRightBuffer();

    push();
    box(100);
    pop();


    //image(leftBuffer, 0, 0);
    //image(rightBuffer, canvasWidth,0);

}

function drawLeftBuffer() {

    leftBuffer.background(0, 0, 0);
    leftBuffer.ellipse(50,50,50);
    //push();
   // translate(canvasWidth/2,canvasHeight/2);
    ///box(100);
    //pop();

}

function drawRightBuffer() {

    rightBuffer.background(255, 100, 255);
    //push();
    //translate(canvasWidth/2,canvasHeight/2);
    //box(100);
    //pop();
	
}

function init(){

}

function windowResized(){

	resizeCanvas(windowWidth,windowHeight);
	canvasWidth = 0.45*windowWidth;
	canvasHeight = windowHeight;

}