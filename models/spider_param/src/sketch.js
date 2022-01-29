let param,gui;

function parameters(){

	this.omega = 0.5;
	this.zeta = 0.5;

	this.input = "impluse"

}

function setup(){

	createCanvas(windowWidth,windowHeight*0.9);

	param = new parameters();
	let gui = new dat.GUI();

	gui.add(param,"omega",0,3,0.001).listen();
	gui.add(param,"zeta",0,2,0.001).listen();
	gui.open();
	
}

function draw(){

	clear();
	drawFunction();

}


let time = 100; // range of x, [0,x]
let step = 10000;
let xval = 2.3; // range of y, [-y,y]

// graph curve
function drawFunction(){

	let left = 0.2*windowWidth;
	let right_ = windowWidth;
	let top_ = 100;
	let bot = 0.9*windowHeight;


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

	}

	let dt = time/step;
	let t = 0;
	let height_ = (bot-top_)/xval;
	let width_ = (right_-left)/step;

	stroke(255,0,0);
	line(0,height_+top_,windowWidth,height_+top_);
	stroke(51);
	strokeWeight(3);
	line(0,height_*2+top_,left,height_*2+top_);
	stroke(150);
	strokeWeight(2);
	line(left,0,left,windowHeight); // y axis
	line(0,height_*2+top_,windowWidth,height_*2+top_); // x axis

	textSize(40);
	noStroke();
	fill(150);
	text("0",left-0.03*windowWidth,height_*2+top_-0.02*windowWidth);
	fill(255,0,0);
	text("1",left-0.03*windowWidth,height_+top_-0.02*windowHeight);
	fill(10);
	text("x(t)",left-0.07*windowWidth,top_);
	text("t",windowWidth*0.5,height_*2+top_+0.05*windowHeight);



	for(let i = 0; i < step; ++i){
		
		//draw line
		let x1 = left+width_*i;
		let y1 = height_*(2-func(t))+top_;
		let x2 = left+width_*(i+1);
		let y2 = height_*(2-func(t+dt))+top_;
		stroke(51);
		line(x1,y1,x2,y2);


		t += dt;

	}

}

function windowResized() {

	resizeCanvas(windowWidth, windowHeight*0.9);

}
