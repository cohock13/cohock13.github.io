//special thanks
//https://www.openprocessing.org/sketch/873271

let param;
let scale_ = 12.5;
let position = [];
let velocity = [];
let x0 = 0;
let y0 = 0;

function parameters() {
	this.mode = "A";
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
	gui.add(param,"mode",["A","A'","B","C","D","D'","E","F","F'","G","H","I","J","K","L","M","N","O","P","Q","R","S"])
	gui.add(param,"num",2,150).step(1);
	gui.add(param,"ka",-3,3).step(0.1);
	gui.add(param,"kb",-3,3).step(0.1);
	gui.add(param,"kp",-3,3).step(0.1);
	gui.add(param,"km",-3,3).step(0.1);
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
	scale_ -= 0.001*event.delta;
	scale_ = constrain(scale_,0.0001,20);
}
function draw() {

	background(0);
	translate(windowWidth/2+x0,windowHeight/2+y0);
	change_k();
	textSize(30);
	strokeWeight(10);
	textFont("Comic Sans MS");
	fill(255);
	noStroke();
	text("Scope: "+str(round(100*scale_)),-windowWidth*0.5+windowWidth*0.03,-windowHeight*0.5+windowHeight*0.08);

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
						velocity[i].add(attract_vetcor(i,j,2));
					}
					else{
						velocity[i].add(attract_vetcor(i,j,3))
					}
				}
			}
		}
		position[i].add(velocity[i].mult(0.1));
		if(param.open_boundary == false){
			if(position[i].x <= -windowWidth/2 || position[i].x >= windowWidth/2|| position[i].y <= -windowHeight/2 || position[i].y >= windowHeight/2){
				velocity[i] = createVector(0,0);
			}
			position[i].x = constrain(position[i].x,-windowWidth/2,windowWidth/2);
			position[i].y = constrain(position[i].y,-windowHeight/2,windowHeight/2);
		}
		stroke(255);
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
	e.mult(amp);
	return e;
}

function change_k() {
	if (param.mode == "A"){
		param.ka = 0.8;
		param.kb = 0.4;
		param.kp = -0.4;
		param.km = -0.8;
	}
	else if(param.mode == "A'"){
		param.ka = 0.8;
		param.kb = 0.4;
		param.kp = 0.4;
		param.km = 0.6;
	}
	else if(param.mode == "B"){
		param.ka = 0.8;
		param.kb = 0.4;
		param.kp = -0.2;
		param.km = 0.0;
	}
	else if(param.mode == "C"){
		param.ka = 0.8;
		param.kb = 0.4;
		param.kp = 0.4;
		param.km = -0.2;
	}
	else if(param.mode == "D"){
		param.ka = 0.8;
		param.kb = 0.4;
		param.kp = 0.2;
		param.km = -0.4;
	}
	else if(param.mode == "D'"){
		param.ka = 0.8;
		param.kb = 0.4;
		param.kp = 0.2;
		param.km = 0.4;
	}
	else if(param.mode == "E"){
		param.ka = 0.8;
		param.kb = 0.4;
		param.kp = 0.6;
		param.km = -0.4;
	}
	else if(param.mode == "F"){
		param.ka = 0.8;
		param.kb = 0.4;
		param.kp = -0.4;
		param.km = -0.8;
	}
	else if(param.mode == "F'"){
		param.ka = 0.8;
		param.kb = 0.4;
		param.kp = 0.4;
		param.km = 0.2;
	}
	else if(param.mode == "G"){
		param.ka = 0.8;
		param.kb = 0.4;
		param.kp = 0.4;
		param.km = 0.4;
	}
	else if(param.mode == "H"){
		param.ka = 0.8;
		param.kb = 0.4;
		param.kp = 0.6;
		param.km = -0.6;
	}
	else if(param.mode == "I"){
		param.ka = 0.8;
		param.kb = 0.4;
		param.kp = 0.6;
		param.km = -0.2;
	}
	else if(param.mode == "J"){
		param.ka = 0.8;
		param.kb = 0.4;
		param.kp = 0.6;
		param.km = 0.8;
	}
	else if(param.mode == "K"){
		param.ka = 0.8;
		param.kb = 0.4;
		param.kp = 0.8;
		param.km = -0.8;
	}
	else if(param.mode == "L"){
		param.ka = 1.2;
		param.kb = 0.0;
		param.kp = -0.0;
		param.km = -0.4;
	}
	else if(param.mode == "M"){
		param.ka = 0.8;
		param.kb = 0.4;
		param.kp = -0.4;
		param.km = -0.8;
	}
	else if(param.mode == "N"){
		param.ka = 0.4;
		param.kb = -0.4;
		param.kp = 0.8;
		param.km = -0.8;
	}
	else if(param.mode == "O"){
		param.ka = 0.4;
		param.kb = 0.1;
		param.kp = 0.6;
		param.km = -0.7;
	}
	else if(param.mode == "P"){
		param.ka = -0.8;
		param.kb = -0.8;
		param.kp = 1.2;
		param.km = 0.2;
	}
	else if(param.mode == "Q"){
		param.ka = -0.4;
		param.kb = -0.8;
		param.kp = 1.2;
		param.km = -0.8;
	}
	else if(param.mode == "R"){
		param.ka = 0.8;
		param.kb = 0.0;
		param.kp = 0.4;
		param.km = -0.8;
	}
	else if(param.mode == "S"){
		param.ka = -0.8;
		param.kb = -0.8;
		param.kp = 1.2;
		param.km = 0.0;
	}
}