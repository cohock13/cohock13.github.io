let carModel;
function preload(){
	carModel = loadModel("car.obj",true);
}

function setup(){
	createCanvas(windowWidth,windowHeight,WEBGL);
}

function draw(){
    background(200);
	rotateX(frameCount*0.01);
	rotateY(frameCount*0.01);
	model(carModel);
	//events();
}