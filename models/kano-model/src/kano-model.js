//special thanks
//https://www.openprocessing.org/sketch/873271

var param;
var position = [];
var velocity = [];

function parameters() {
	this.agent_num = 10;
	this.k_p = 0.5;
	this.k_m = 0.4;
	this.k_a = 0.6;
	this.reset = function() {
		init();
	}
}

function setup() {
	createCanvas(windowWidth,windowHeight);
	init();
	strokeWeight(5);
	colorMode(HSB);
	var gui = new dat.GUI();
	param = new parameters();
	gui.add(param,"agent_num",2,30).step(1);
	gui.add(param,"k_p",-5,5).step(0.1);
	gui.add(param,"k_m",-5,5).step(0.1);
	gui.add(param,"k_a",-5,5).step(0.1);
	gui.add(param,"reset");
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {

	background(0);
	textSize(30);
	strokeWeight(5);
	textFont("Comic Sans MS");
	fill(255);
	noStroke();
	text("加納モデル",windowWidth*0.03,windowHeight*0.08);

	for(let i = 0;i<param.agent_num;++i){
		var tmp = 0;
		for(let j = 0;j<param.agent_num;++j){
			if(i != j){
				if(i == 0){
					velocity[i].add(attract_vetcor(i,j,0));
				}
				else if(j == 0){
					velocity[i].add(attract_vetcor(i,j,1));
				}
				else{
					velocity[i].add(attract_vetcor(i,j,2));
				}
			}
		}
		position[i].add(position[i]);
		line(position[i].x,position[i].y,position[x]-velocity[i].x,position[i].y-velocity[i].y);
	}
}


function init() {
	background(0);
	for(let i = 0;i<param.agent_num;++i){
		position[i] = createVector(random(width),random(height));
		vetcor[i] = createVector(0,0);
	}
	
}

function attract_vetcor(i,j,n) {
	let distance = dist(position[i].x,position[i].y,position[j].x,position[j].y);
	let e = createVector(position[j].x-position[i].x,position[j].y-position[i].y);
	e.normalize();
	if (n == 0){
		return e.mult((param.k_p+param.k_m)/distance-1/(distance*distance))
	}
	else if (n == 1){
		return e.mult((param.k_p-param.k_m)/distance-1/(distance*distance))
	}
	else{
		return e.mult((param.k_a)/distance-1/(distance*distance))
	}
}