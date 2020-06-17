//special thanks
//https://www.openprocessing.org/sketch/873271

let param;
let scale_ = 1;
let position = [];
let velocity = [];
let x0 = 0;
let y0 = 0;

function parameters() {
	this.agent_num = 50;
	this.num= 50;
	this.kp = 0.4;
	this.km = 0.6;
	this.ka = 0.8;
	this.kb = 0.4;
	this.open_boundary = false;
	this.reset = function() {
		this.agent_num = this.num;
		init();
	}
}

function setup() {
	createCanvas(windowWidth,windowHeight);
	param = new parameters();
	background(0);
	init();
	strokeWeight(5);
	colorMode(RGB);
	let gui = new dat.GUI();
	gui.add(param,"num",2,70).step(1);
	gui.add(param,"ka",-5,5).step(0.1);
	gui.add(param,"kb",-5,5).step(0.1);
	gui.add(param,"kp",-5,5).step(0.1);
	gui.add(param,"km",-5,5).step(0.1);
	gui.add(param,"open_boundary");
	gui.add(param,"reset");
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mouseDragged() {
	x0 += mouseX - pmouseX;
	y0 += mouseY - pmouseY;
}

function mouseWheel(event) {
	scale_ += 0.0002*event.delta;
	scale_ = constrain(scale_,0.0001,3);
}
function draw() {

	background(0);
	translate(windowWidth/2+x0,windowHeight/2+y0);
	textSize(30);
	strokeWeight(10);
	textFont("Comic Sans MS");
	fill(255);
	noStroke();
	text(str(scale_),-windowWidth*0.5+windowWidth*0.03,-windowHeight*0.5+windowHeight*0.08);

	for(let i = 0;i<param.agent_num;++i){
		for(let j = 0;j<param.agent_num;++j){
			if(i != j){
				if(i <= 24){
					if(j <= 24){
						velocity[i].add(attract_vetcor(i,j,0));
					}
					else{
						velocity[i].add(attract_vetcor(i,j,1));
					}
				}
				else{
					if(j <= 24){
						velocity[i].add(attract_vetcor(i,j,3));
					}
					else{
						velocity[i].add(attract_vetcor(i,j,4))
					}
				}
			}
		}
		position[i].add(velocity[i]);
		if(param.open_boundary == false){
			if(position[i].x <= -windowWidth/2 || position[i].x >= windowWidth/2|| position[i].y <= -windowHeight/2 || position[i].y >= windowHeight/2){
				velocity[i] = createVector(0,0);
			}
			position[i].x = constrain(position[i].x,-windowWidth/2,windowWidth/2);
			position[i].y = constrain(position[i].y,-windowHeight/2,windowHeight/2);
		}
		if(i == 0){
			stroke(255,0,0);
		}
		else{
			stroke(255);
		}
		line(scale_*position[i].x,scale_*position[i].y,scale_*position[i].x,scale_*position[i].y);
	}
}

function init() {
	background(0);
	for(let i = 0;i<param.agent_num;++i){
		let cx = windowWidth/2;
		let cy = windowHeight/2;
		position[i] = createVector(random(-5,5),random(-5,5));
		//position[i] = createVector(random(0.2*windowWidth,0.8*windowWidth),random(0.2*windowHeight,0.8*windowHeight));
		velocity[i] = createVector(0,0);
	}
}

function attract_vetcor(i,j,n) {
	let distance = dist(position[i].x,position[i].y,position[j].x,position[j].y);
	let e = createVector(position[j].x-position[i].x,position[j].y-position[i].y);
	e.normalize();
	let amp = 0;
	if(n == 0){
		amp = (param.ka)/distance-1/(distance*distance);
	}else if(n == 1){
		amp = (param.kp+param.km)/distance-1/(distance*distance);
	}else if(n == 2){
		amp = (param.kp-param.km)/distance-1/(distance*distance);
	}
	else{
		amp = param.kb/distance - 1/(distance*distance);
	}
	e.mult(amp)
	return e;
}