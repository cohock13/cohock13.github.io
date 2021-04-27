//----- parameters -----//

let xPosition = 0;
let zPosition = 0;

let speed = 0;
let deltaSpeed = 0.3;
let speedThreshold = 0.1;
let maxSpeed = 7;
let minSpeed = -7;
let speedDeceleration = 0.1;
let rotateAngle = 0;
let deltaRotateAngle = 1.5;

let cameraX = 0;
let cameraY = 0;
let cameraZ = 0;

let img;
let modelData;
//----------------------//

function setup(){

	createCanvas(windowWidth*0.9,windowHeight*0.9,WEBGL);
	img = loadImage('map.png');
	//modelData = loadModel('car.obj');
	angleMode(DEGREES);
	reset();

}

function draw(){

	clear();
	background(3,152,252)
	setGround();

	// speed and position update
	updateSpeedsAndPositon();

	// draw objects and collision detection
	drawObjects();

	// agent and camera update
	moveAgent();

	// TBA
	//events();

}

function setGround(){

	push();
	translate(0,15,0);
	fill(color(65));
	texture(img);
	box(5000,20,5000);
	pop();

}


// speed update by keypress and position update
function updateSpeedsAndPositon(){

	// speed control
	// 1. speed is 0 when abs speed is too low
	if(abs(speed) < speedThreshold){
		speed = 0;
	}
	
	// 2. deceleration by friction
	if(speed > 0){
		speed -= speedDeceleration;
	}
	else{
		speed += speedDeceleration;
	}

	// 3. speed has max and min
	speed = constrain(speed,minSpeed,maxSpeed);


	// go forward by "w" or up_arrow
	if(keyIsDown(87) || keyIsDown(38)){
		speed -= deltaSpeed;
	}

	// go backward by "s" or down_arrow
	if(keyIsDown(83) || keyIsDown(40)){
		speed += deltaSpeed;
	}

	// rotate right by "d" or right_arrow
	if(keyIsDown(68)||keyIsDown(39)){
		rotateAngle -= deltaRotateAngle;
	}

	// rotate left by "a" or left_arrow
	if(keyIsDown(65)||keyIsDown(37)){
		rotateAngle += deltaRotateAngle;
	}


	
	xPosition += speed*sin(rotateAngle); 
	zPosition += speed*cos(rotateAngle);

}

// draw objects and collision detection(position is updated when collision detected)
function drawObjects(){

}

// update agent and camera
function moveAgent(){

	// draw agent
	push();
	translate(xPosition,-10,zPosition);
	rotateY(rotateAngle);
	fill("blue");
	box(30);

	//model(modelData);
	pop();

	// set camera
	let x = xPosition - 300*sin(rotateAngle-180); 
	let y = -120;
	let z = zPosition - 300*cos(rotateAngle-180);
	let xx = xPosition;
	let yy = -30;
	let zz = zPosition;

	camera(x,y,z,xx,yy,zz, 0, 1, 0);

}


// resets when r pressed , change camera view when c pressed
function keyTyped(){

	if(key === "r"){
		reset();
	}

	else if(key === "t"){
		// third person
		changeCameraView("TPP");
	}
	else if(key === "f"){
		// first person 
		changeCameraView("FPP");
	}
}

// reset agent's position, velocity (and position of camera)
function reset(){

	xPosition = 0;
	zPosition = 0;
	speed = 0;
	rotateAngle = 0;

}

// change camera view
// キャリブレーションの設定をここでする
function changeCameraView(style){
	if(style === "TPP"){
		
		
	}
	else{

	}
}

