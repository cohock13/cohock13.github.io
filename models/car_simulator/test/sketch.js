//----- parameters -----//

<<<<<<< HEAD
function parameters(){
	this.deltaSpeed = 0.3;
	this.maxSpeed = 10;
	this.minSpeed = -7;
	this.speedDeceleration = 0.05;
	this.deltaRotationAngle = 1.5
}

=======
>>>>>>> dcc80e1f2ff31be236584f31050867f5ea2078db
let xPosition = 0;
let zPosition = 0;

let speed = 0;
<<<<<<< HEAD
let rotateAngle = 0;

this.speedThreshold = 0.1;
=======
let deltaSpeed = 0.3;
let speedThreshold = 0.1;
let maxSpeed = 10;
let minSpeed = -7;
let speedDeceleration = 0.1;
let rotateAngle = 0;
let deltaRotateAngle = 1.5;
>>>>>>> dcc80e1f2ff31be236584f31050867f5ea2078db

let cameraX = 0;
let cameraY = 0;
let cameraZ = 0;

<<<<<<< HEAD
let isCameraTPP = true;
let param;
=======
let cameraMode = "TPP";
>>>>>>> dcc80e1f2ff31be236584f31050867f5ea2078db
let img;
let modelData;
let font;
//----------------------//
function preload(){

<<<<<<< HEAD
	font = loadFont("https://cohock13.github.io/models/car_simulator/src/NotoSansCJKjp-Bold.otf");
=======
	font = loadFont("https://cohock13.github.io/models/car_simulator/src/NotoSansCJKjp-Bold.otf")
>>>>>>> dcc80e1f2ff31be236584f31050867f5ea2078db
    modelData = loadModel('https://cohock13.github.io/models/car_simulator/src/car.obj',true);

}

function setup(){

	createCanvas(windowWidth,windowHeight*0.99,WEBGL);
	img = loadImage('https://cohock13.github.io/models/car_simulator/src/map.png');
<<<<<<< HEAD
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
=======
	//modelData = loadModel('car.obj');
	angleMode(DEGREES);
	reset();
>>>>>>> dcc80e1f2ff31be236584f31050867f5ea2078db
	
}

function draw(){

<<<<<<< HEAD
	//clear();
=======
	clear();
>>>>>>> dcc80e1f2ff31be236584f31050867f5ea2078db
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

<<<<<<< HEAD
	push();
	textSize(10);
	translate(xPosition,-175,zPosition);
	rotateY(rotateAngle);
	rotateX(15);
	text("WASDで移動 / ↑↓でアクセル操作 / cで視点変更 / GUIでパラメータ調整",-310,0);
	text("FPS:"+round(frameRate()),-310,15);
	pop();
=======
	textSize(25);
	// translate (x/1.5-230,speed+y/1.5-100,z)
	noStroke();
	text("操作：WASD or 矢印 / tで三人称視点・fで一人称視点",-width/2+20,-height/2+30);
	text("FPS:"+round(frameRate()),-width/2+20,-height/2+90);
>>>>>>> dcc80e1f2ff31be236584f31050867f5ea2078db

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
<<<<<<< HEAD
		speed -= param.speedDeceleration;
	}
	else if(speed < 0){
		speed += param.speedDeceleration;
	}

	// 3. speed has max and min
	speed = constrain(speed,-param.maxSpeed,-param.minSpeed);
=======
		speed -= speedDeceleration;
	}
	else{
		speed += speedDeceleration;
	}

	// 3. speed has max and min
	speed = constrain(speed,minSpeed,maxSpeed);
>>>>>>> dcc80e1f2ff31be236584f31050867f5ea2078db


	// go forward by "w" or up_arrow
	if(keyIsDown(87) || keyIsDown(38)){
<<<<<<< HEAD
		speed -= param.deltaSpeed;
=======
		speed -= deltaSpeed;
>>>>>>> dcc80e1f2ff31be236584f31050867f5ea2078db
	}

	// go backward by "s" or down_arrow
	if(keyIsDown(83) || keyIsDown(40)){
<<<<<<< HEAD
		speed += 0.4*param.deltaSpeed;
=======
		speed += deltaSpeed;
>>>>>>> dcc80e1f2ff31be236584f31050867f5ea2078db
	}

	// rotate right by "d" or right_arrow
	if(keyIsDown(68)||keyIsDown(39)){
<<<<<<< HEAD
		rotateAngle -= param.deltaRotationAngle;
=======
		rotateAngle -= deltaRotateAngle;
>>>>>>> dcc80e1f2ff31be236584f31050867f5ea2078db
	}

	// rotate left by "a" or left_arrow
	if(keyIsDown(65)||keyIsDown(37)){
<<<<<<< HEAD
		rotateAngle += param.deltaRotationAngle;
	}

=======
		rotateAngle += deltaRotateAngle;
	}


	
>>>>>>> dcc80e1f2ff31be236584f31050867f5ea2078db
	xPosition += speed*sin(rotateAngle); 
	zPosition += speed*cos(rotateAngle);

}

// draw objects and collision detection(position is updated when collision detected)
function drawObjects(){

}

// update agent and camera
function moveAgent(){

<<<<<<< HEAD
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
=======
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
>>>>>>> dcc80e1f2ff31be236584f31050867f5ea2078db
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
<<<<<<< HEAD
		centerX = xPosition + 120*sin(rotateAngle-180);
		centerY = -40;
		centerZ = zPosition + 120*cos(rotateAngle-180);
=======
		centerX = xPosition + 100*sin(rotateAngle-180);
		centerY = -40;
		centerZ = zPosition + 100*cos(rotateAngle-180);
>>>>>>> dcc80e1f2ff31be236584f31050867f5ea2078db
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

<<<<<<< HEAD
	else if(key === "c"){
		// switch tpp <-> fpp
		isCameraTPP = !isCameraTPP; 
=======
	else if(key === "t"){
		// third person
		cameraMode = "TPP";
	}
	else if(key === "f"){
		// first person 
		cameraMode = "FPP";
>>>>>>> dcc80e1f2ff31be236584f31050867f5ea2078db
	}
}

// reset agent's position, velocity (and position of camera)
function reset(){

	xPosition = 0;
	zPosition = 0;
	speed = 0;
	rotateAngle = 0;

}

<<<<<<< HEAD
function windowResized() {

	resizeCanvas(windowWidth, windowHeight);

}

=======
>>>>>>> dcc80e1f2ff31be236584f31050867f5ea2078db

