//----- parameters -----//

function parameters(){
	this.deltaSpeed = 0.3;
	this.maxSpeed = 10;
	this.minSpeed = -7;
	this.speedDeceleration = 0.05;
	this.deltaRotationAngle = 1.5
}

let xPosition = 0;
let zPosition = 0;

let speed = 0;
let rotateAngle = 0;

this.speedThreshold = 0.1;

let cameraX = 0;
let cameraY = 0;
let cameraZ = 0;

let isCameraTPP = true;
let param;
let img;
let modelData;
let font;
//----------------------//
function preload(){

	font = loadFont("https://cohock13.github.io/models/car_simulator/src/NotoSansCJKjp-Bold.otf");
    modelData = loadModel('https://cohock13.github.io/models/car_simulator/src/car.obj',true);

}

function setup(){

	createCanvas(windowWidth,windowHeight*0.99,WEBGL);
	img = loadImage('https://cohock13.github.io/models/car_simulator/src/map.png');
	textFont(font);
	angleMode(DEGREES);
	reset();

	//GUI関連
	param = new parameters();
	let gui = new dat.GUI();

	let vehicleParameter = gui.addFolder("Speed Parameter");
	vehicleParameter.add(param,"deltaSpeed",0,1,0.01).name("Acceleration");
	vehicleParameter.add(param,"speedDeceleration",0,0.2,0.01).name("Deceleration");
	vehicleParameter.add(param,"maxSpeed",0,15,0.1).name("Max Speed");
	vehicleParameter.add(param,"minSpeed",-15,0,0.1).name("min Speed");
	vehicleParameter.open();

	let wheelParameter = gui.addFolder("Angle Paramter");
	wheelParameter.add(param,"deltaRotationAngle",0,3,0.1).name("Sensitivity");
	wheelParameter.open();

	gui.open();
	
}

function draw(){

	//clear();
	background(3,152,252)
	setGround();
	drawTexts();

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

function drawTexts(){

	push();
	textSize(10);
	translate(xPosition,-175,zPosition);
	rotateY(rotateAngle);
	rotateX(15);
	text("WASDで移動 / ↑↓でアクセル操作 / cで視点変更 / GUIでパラメータ調整",-310,0);
	text("FPS:"+round(frameRate()),-310,15);
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
	speed = constrain(speed,-param.maxSpeed,-param.minSpeed);


	// go forward by "w" or up_arrow
	if(keyIsDown(87) || keyIsDown(38)){
		speed -= param.deltaSpeed;
	}

	// go backward by "s" or down_arrow
	if(keyIsDown(83) || keyIsDown(40)){
		speed += 0.4*param.deltaSpeed;
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
		model(modelData);
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

	xPosition = 0;
	zPosition = 0;
	speed = 0;
	rotateAngle = 0;

}

function windowResized() {

	resizeCanvas(windowWidth, windowHeight);

}


