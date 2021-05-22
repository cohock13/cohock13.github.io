//----- parameters -----//

function parameters(){
	this.targetVelocity = 0;
	this.speedDeceleration = 0.03;
	this.rotationVelocity = 0;
	this.handleMouseMode = false;
	this.recording = false;
    this.exportCSV = function(){

        // output 

        let data = records.map((record)=>record.join(',')).join('\r\n');
         
        let bom  = new Uint8Array([0xEF, 0xBB, 0xBF]);
        let blob = new Blob([bom, data], {type: 'text/csv'});
        let url = (window.URL || window.webkitURL).createObjectURL(blob);
        let link = document.createElement('a');
        link.download = 'result.csv';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        //array reset
        records = [recordIndex];
    }
}

let time = 0;
let records = [];
let recordsIndex = ["time","positionX","positionY","velocity(abs)","velocityX","velocityY","acceleration(abs)","accelerationX","accelerationY","Jerk(abs)","JerkX","JerkY","angularVelocity"]
let tmpVelocityRecord = [0];
let tmpAccRecord = [0,0];
let tmpJerkRecord = [0];

let xPosition;
let zPosition;

let speed = 0;
let rotateAngle = 0;
let deltaRotationAngle = 0.05;
let wheelResilience = 0.02;
let maxRotationVelocity = 1;
let deltaSpeed = 0.08; // targetVelocity += delta
let maxSpeed = 15;
let speedFeedbackGain = 1.2;
this.speedThreshold = 0.04;

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

let hoge = 20;
//----------------------//
function preload(){

    carModelData = loadModel('https://cohock13.github.io/models/car_simulator/src/car.obj',true);

	lampModel = loadModel("https://cohock13.github.io/models/car_simulator/test/obj/streetlamp.obj");

}

function setup(){

	createCanvas(windowWidth,windowHeight*0.9,WEBGL);
	frameRate(60);
	//roadTexture = loadImage('https://cohock13.github.io/models/car_simulator/src/map.png');
	roadTexture= loadImage('https://cohock13.github.io/models/car_simulator/test/map_2.png');

	param = new parameters();
	angleMode(DEGREES);
	reset();

	// ----------------------- GUI Settings ---------------------------------------

	let gui = new dat.GUI();

	let vehicleParameterGUI = gui.addFolder("Speed Parameter");
	vehicleParameterGUI.add(param,"targetVelocity",0,15,0.2).name("Target Velocity").listen();
	vehicleParameterGUI.add(param,"speedDeceleration",0,0.2,0.01).name("Friction");
	vehicleParameterGUI.open();

	let wheelParameterGUI = gui.addFolder("Angle Parameter");
	wheelParameterGUI.add(param,"rotationVelocity",-1,1,0.1).name("Velocity").listen();
	wheelParameterGUI.open();

	let recordingGUI = gui.addFolder("Data recording");
	recordingGUI.add(param,"recording").name("Recording");
	recordingGUI.add(param,"exportCSV").name("Export CSV");
	recordingGUI.open();

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
	events();

	// Recording Data
	recordData();

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
	speed = constrain(speed,0,maxSpeed);

	param.targetVelocity = constrain(param.targetVelocity,0,maxSpeed);

	// go forward by "w" 
	if(keyIsDown(87)||keyIsDown(38)){
		param.targetVelocity += deltaSpeed;
	}

	// go backward by "s" 
	if(keyIsDown(83)||keyIsDown(40)){
		param.targetVelocity -= deltaSpeed;
	}

	// rotate right by "d" or right_arrow
	if(keyIsDown(68)||keyIsDown(39)){
		param.rotationVelocity -= deltaRotationAngle;
	}

	// rotate left by "a" or left_arrow
	if(keyIsDown(65)||keyIsDown(37)){
		param.rotationVelocity += deltaRotationAngle;
	}

	// angular resilience
	if(param.rotationVelocity > 0){
		param.rotationVelocity -= wheelResilience;
	}
	else{
		param.rotationVelocity += wheelResilience;
	}

	if(abs(param.rotationVelocity) <= wheelResilience){
		param.rotationVelocity = 0;
	}

	//angular constrain
	param.rotationVelocity = constrain(param.rotationVelocity,-maxRotationVelocity,maxRotationVelocity);

	rotateAngle += param.rotationVelocity;
	speed += speedFeedbackGain*(-param.targetVelocity-speed);

	/*
	if(param.handleMouseMode){
		let w = windowWidth/2;
		rotateAngle = -180*((mouseX-w)/w);
	}
	*/

	xPosition += speed*sin(rotateAngle); 
	zPosition += speed*cos(rotateAngle);

}

// draw objects and collision detection(position is updated when collision detected)
function drawObjects(){

	// lamp
	setObjectModel(lampModel,color('rgb(200,200,200)'),45,0,1500,0);
	setObjectModel(lampModel,color('rgb(200,200,200)'),45,-1500,-1500,0);

	setObjectAndDetectCollision(color('rgb(50,50,50)'),0,0,900,100);
	setObjectAndDetectCollision(color('rgb(50,50,50)'),1500,1500,900,100);
	setObjectAndDetectCollision(color('rgb(70,70,70)'),-1500,0,900,100);
	setObjectAndDetectCollision(color('rgb(60,60,60)'),1500,0,900,100);
	setObjectAndDetectCollision(color('rgb(60,60,60)'),1500,-1550,900,100);
	setObjectAndDetectCollision(color('rgb(90,90,90)'),-1500,1500,900,100);
	setObjectAndDetectCollision(color('rgb(100,100,100)'),0,-1500,900,100);



}

function setObjectModel(model_,color_,scale_,centerX,centerZ,height_,rotate=false){

	// model seting
	push();
	translate(centerX,height_,centerZ);
	fill(color_)
	if(rotate){
		rotateY(-90);
	}
	rotateX(180);
	strokeWeight(1);
	stroke(50,50,50);
	scale(scale_);
	model(model_);
	pop();
}

function setObjectAndDetectCollision(color_,centerX,centerZ,width_,height_){

	// model setting
	push();
	translate(centerX,-height_,centerZ);
	fill(color_);
	box(width_);
	pop();

	//collision detection
	let delta = 100; 
	let top = centerZ+width_/2;
	let down = centerZ-width_/2;
	let left = centerX-width_/2;
	let right = centerX+width_/2;
	
	//left
	if(left-delta <= xPosition && xPosition <= left && down <= zPosition && zPosition <= top){
		xPosition = left-delta;
	}
	//right
	if(right <= xPosition && xPosition <= right+delta && down <= zPosition && zPosition <= top){
		xPosition = right+delta;
	}
	//top
	if(left <= xPosition && xPosition <= right && top <= zPosition && zPosition <= top+delta){
		zPosition = top+delta;
	}
	//down
	if(left <= xPosition && xPosition <= right && down-delta <= zPosition && zPosition <= down){
		zPosition = down-delta;
	}
	

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

let xStartPosition = -800;
let zStartPosition = 1100;
let eventStartFlag = false;
let eventDoneFlag = false;
let eventCarPosition = -2000; // default start pos :(-2000,700)
let eventCarEndPosition = 400; // default end pos : (400,700)
function events(){

	let startPositionFlag = (xStartPosition-100 <= xPosition && xPosition <= xStartPosition+100 && zStartPosition-100 <= zPosition && zPosition <= zStartPosition+100)
	// event 1 : car speedruns when you over a line
	if((startPositionFlag || eventStartFlag) && !eventDoneFlag){
		setObjectModel(carModelData,color('rgb(50,50,200)'),1.3,eventCarPosition,700,-30,rotate=true);
		eventCarPosition += 30;
		eventStartFlag = true;
	}
	if(eventCarPosition >= eventCarEndPosition){
		eventDoneFlag = true;
	}
}

// Data Recording
function recordData(){
	
	// time calc
	let dt = 1/60;
	time += dt;

	// acceleration and jerk calc
	tmpVelocityRecord.push(-speed);
	
	let currentAcceleration = (tmpVelocityRecord[1]-tmpVelocityRecord[0])/dt;
	tmpAccRecord.push(currentAcceleration);

	let currentJerk = (tmpAccRecord[2]-tmpAccRecord[1])/dt;
	tmpJerkRecord.push(currentJerk);

	tmpVelocityRecord.shift();
	tmpAccRecord.shift();
	tmpJerkRecord.shift();


	if(param.recording){

		// collection data
		let data = [];

		//time
		data.push(time);
		// position
		data.push(xPosition);
		data.push(zPosition);
		// velocity
		let tmpSpeed = -speed;
		data.push(tmpSpeed);
		data.push(tmpSpeed*Math.sin(rotateAngle));
		data.push(tmpSpeed*Math.cos(rotateAngle));
		// acceleration
		let tmpAcc = tmpAccRecord[1];
		data.push(tmpAcc);
		data.push(tmpAcc*Math.sin(rotateAngle));
		data.push(tmpAcc*Math.cos(rotateAngle));
		// jerk
		let tmpJerk = tmpJerkRecord[0];
		data.push(tmpJerk);
		data.push(tmpJerk*Math.sin(rotateAngle));
		data.push(tmpJerk*Math.cos(rotateAngle));
		//angular velocity
		data.push(param.rotationVelocity);

		//push array to record
		records.push(data);
	}

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
	param.targetVelocity = 0;
	records = [recordsIndex];
	//event
	eventDoneFlag = false;
	eventStartFlag = false;
	eventCarPosition = -2000



}

function windowResized() {

	resizeCanvas(windowWidth, windowHeight);

}


