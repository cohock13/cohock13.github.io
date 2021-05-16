//----- parameters -----//

function parameters(){
	this.deltaSpeed = 0.1;
	this.maxSpeed = 10;
	this.speedDeceleration = 0.05;
	this.deltaRotationAngle = 1.1;
}

let xPosition;
let zPosition;

let speed = 0;
let rotateAngle = 0;

this.speedThreshold = 0.1;

let cameraX = 0;
let cameraY = 0;
let cameraZ = 0;

let isCameraTPP = true;
let param;

let carModelData;
let houseModel_1;
let houseModel_2;
let houseModel_3;
let buildingModel_1;
let buildingModel_2;
let buildingModel_3;
let buildingModel_4;
let lampModel;

let roadTexture;
let texture_1;
let texture_2;
let texture_3;
let font;
//----------------------//
function preload(){

    carModelData = loadModel('https://cohock13.github.io/models/car_simulator/src/car.obj',true);

	lampModel = loadModel("https://cohock13.github.io/models/car_simulator/test/obj/streetlamp.obj");

}

function setup(){

	createCanvas(windowWidth,windowHeight*0.95,WEBGL);

	//roadTexture = loadImage('https://cohock13.github.io/models/car_simulator/src/map.png');
	roadTexture= loadImage('https://cohock13.github.io/models/car_simulator/test/map_2.png');

	angleMode(DEGREES);
	reset();

	// ----------------------- GUI Settings ---------------------------------------
	param = new parameters();
	let gui = new dat.GUI();

	let vehicleParameterGUI = gui.addFolder("Speed Parameter");
	vehicleParameterGUI.add(param,"deltaSpeed",0,0.3,0.01).name("Acceleration").listen();
	vehicleParameterGUI.add(param,"speedDeceleration",0,0.2,0.01).name("Friction");
	vehicleParameterGUI.add(param,"maxSpeed",0,20,0.1).name("Max Speed");
	vehicleParameterGUI.open();

	let wheelParameterGUI = gui.addFolder("Angle Paramter");
	wheelParameterGUI.add(param,"deltaRotationAngle",0,3,0.1).name("Sensitivity");
	wheelParameterGUI.open();

	gui.open();
    //------- --------------------------------------------------------------------
	
}

function draw(){

	//clear();
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
	texture(roadTexture);
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
		speed -= param.speedDeceleration;
	}
	else if(speed < 0){
		speed += param.speedDeceleration;
	}

	// 3. speed has max and min
	speed = constrain(speed,-param.maxSpeed,param.maxSpeed);



	// speed adjustment by up/down arrow
	if(keyIsDown(38)){
		param.deltaSpeed += 0.001;
	}

	if(keyIsDown(40)){
		param.deltaSpeed -= 0.001;
	}

	param.deltaSpeed = constrain(param.deltaSpeed,-0.3,0.3);


	// go forward by "w" 
	if(keyIsDown(87)){
		speed -= param.deltaSpeed;
	}

	// go backward by "s" 
	if(keyIsDown(83)){
		speed += param.deltaSpeed;
	}

	// rotate right by "d" or right_arrow
	if(keyIsDown(68)||keyIsDown(39)){
		rotateAngle -= param.deltaRotationAngle;
	}

	// rotate left by "a" or left_arrow
	if(keyIsDown(65)||keyIsDown(37)){
		rotateAngle += param.deltaRotationAngle;
	}

	xPosition += speed*sin(rotateAngle); 
	zPosition += speed*cos(rotateAngle);

}

// draw objects and collision detection(position is updated when collision detected)
function drawObjects(){

	// lamp
	setObjectModel(lampModel,45,0,1500);
	setObjectModel(lampModel,45,-1500,-1500);

}

function setObjectModel(model_,scale_,centerX,centerZ,rotate=false){

	// model set
	push();
	translate(centerX,0,centerZ);
	color(100,100,100);
	if(rotate){
		rotateY(90);
	}
	rotateX(180);
	strokeWeight(2);
	stroke(150,150,150);
	scale(scale_);
	model(model_);
	pop();

	// collision detection

}


// update agent and camera
function moveAgent(){

	// draw agent if camera is TPP
	if(isCameraTPP){
		push();
		translate(xPosition,-30,zPosition);
		scale(0.65);
		rotateY(rotateAngle);
		rotateX(180);
		fill(200,50,50);
		stroke(150,50,50);
		strokeWeight(1);
		model(carModelData);
		pop();
	}

	// set camera

	let x,y,z,centerX,centerY,centerZ,upX,upY,upZ;

	if(isCameraTPP){
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
		centerX = xPosition + 120*sin(rotateAngle-180);
		centerY = -40;
		centerZ = zPosition + 120*cos(rotateAngle-180);
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

	else if(key === "c"){
		// switch tpp <-> fpp
		isCameraTPP = !isCameraTPP; 
	}
}

// reset agent's position, velocity (and position of camera)
function reset(){

	xPosition = -800;
	zPosition = 1900;
	speed = 0;
	rotateAngle = 0;

}

function windowResized() {

	resizeCanvas(windowWidth, windowHeight);

}


