//----- parameters -----//

let xPosition = 0;
let zPosition = 0;

let speed = 0;
let deltaSpeed = 0.3;
let speedThreshold = 0.1;
let maxSpeed = 10;
let minSpeed = -7;
let speedDeceleration = 0.1;
let rotateAngle = 0;
let deltaRotateAngle = 1.5;

let cameraX = 0;
let cameraY = 0;
let cameraZ = 0;

let cameraMode = "TPP";
let img;
let modelData;
//----------------------//
function preload(){
    modelData = loadModel('https://cohock13.github.io/models/3dtest/car.obj',true);
}

function setup(){

	createCanvas(windowWidth,windowHeight*0.99,WEBGL);
	img = loadImage('https://cohock13.github.io/models/car_simulator/src/map.png');
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
	translate(xPosition,-30,zPosition);
	scale(0.65);
	rotateY(rotateAngle);
	rotateX(180);
	fill(200,50,50);
    stroke(150,50,50);
	strokeWeight(1);
	model(modelData);
	pop();

	// set camera


	let x,y,z,centerX,centerY,centerZ,upX,upY,upZ;

	if(cameraMode === "TPP"){
		x = xPosition - 300*sin(rotateAngle-180); 
		y = -120;
		z = zPosition - 300*cos(rotateAngle-180);
		centerX = xPosition;
		centerY = -30;
		centerZ	= zPosition;
		upX = 0;
		upY = 1;
		upZ = 0;
	}
	else{
		x = xPosition; 
		y = -50;
		z = zPosition;
		centerX = xPosition + 100*sin(rotateAngle-180);
		centerY = -40;
		centerZ = zPosition + 100*cos(rotateAngle-180);
		upX = 0;
		upY = 1;
		upZ = 0;
	}

	camera(x,y,z,centerX,centerY,centerZ, upX, upY, upZ);

}


// resets when r pressed , change camera view when c pressed
function keyTyped(){

	if(key === "r"){
		reset();
	}

	else if(key === "t"){
		// third person
		cameraMode = "TPP";
	}
	else if(key === "f"){
		// first person 
		cameraMode = "FPP";
	}
}

// reset agent's position, velocity (and position of camera)
function reset(){

	xPosition = 0;
	zPosition = 0;
	speed = 0;
	rotateAngle = 0;

}


