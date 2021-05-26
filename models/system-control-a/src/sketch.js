let param,gui;

function parameters(){

	this.m = 1;
	this.c = 1;
	this.k = 1;

	this.omega = 0;
	this.zeta = 0;

	this.input = "impluse"

}

function setup(){

	createCanvas(windowWidth,windowHeight*0.9);

	param = new parameters();
	let gui = new dat.GUI();

	let explicitParametersGUI = gui.addFolder("Explicit Parameters");
	explicitParametersGUI.add(param,"m",0.01,5,0.01);
	explicitParametersGUI.add(param,"c",0,5,0.01);
	explicitParametersGUI.add(param,"k",0.01,5,0.01);
	explicitParametersGUI.open();

	let implicitParametersGUI = gui.addFolder("Implicit Parameters");
	implicitParametersGUI.add(param,"omega",0,3,0.01).listen();
	implicitParametersGUI.add(param,"zeta",0,3,0.001).listen();
	implicitParametersGUI.open();

	let inputModeGUI = gui.addFolder("Input Mode");
	inputModeGUI.add(param,"input",["impluse","step"]).name("input");
	inputModeGUI.open();

	gui.open();
	
}

function draw(){

	param.omega = Math.sqrt(param.k/param.m);
	param.zeta = param.c/(2*Math.sqrt(param.m*param.k));

	clear();
	drawFunction();

}


let time = 100; // range of x, [0,x]
let step = 10000;
let xval = 2; // range of y, [-y,y]

// graph curve
function drawFunction(){

	let left = 0.1*windowWidth;
	let right_ = 0.9*windowWidth;
	let top_ = 0.1*windowHeight;
	let bot = 0.9*windowHeight;
	let mid = windowHeight/2;

	let func;
	let z = param.zeta;
	let om = param.omega;

	if(param.zeta > 1){
		
		let sq = Math.sqrt(z**2-1);
		func = (t) => 1-Math.exp(-z*om*t)*(Math.cosh(sq*om*t)+z/sq*Math.sinh(sq*om*t));

	}
	else if(param.zeta === 1){

		func = (t) => 1-Math.exp(-om*t)*(1+om*t);

	}
	else if(0 < param.zeta && param.zeta <1){

		let sq = Math.sqrt(1-z**2);
		func = (t) => 1-Math.exp(-z*om*t)*(Math.cos(sq*om*t)+z/sq*Math.sin(sq*om*t));

	}
	else{

		func = (t) => 1-Math.cos(om*t);
		console.log("ok");

	}

	let dt = time/step;
	let t = 0;
	let height_ = (bot-top_)/xval;
	let width_ = (right_-left)/step;

	stroke(255,0,0);
	line(0,height_,windowWidth,height_);


	for(let i = 0; i < step; ++i){
		


		//draw line
		let x1 = width_*i;
		let y1 = height_*func(t);
		let x2 = width_*(i+1);
		let y2 = height_*func(t+dt);
		stroke(51);
		line(x1,y1,x2,y2);
		stroke(100);
		strokeWeight(3);

		t += dt;

	}

}