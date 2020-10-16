
let easycam,param;
let boids = [];
let tmpForce = [];
let n;

//刻み幅
let dt = 0.005;

function parameters(){

	this.color = "rgb(27,232,100)";

	this.N = 100;
	this.minSpeed = 500;
	this.MaxSpeed = 1500;
	
	this.CohesionForce = 3;
	this.CohesionDistance = 300;
	this.CohesionAngle = 120;

	this.SeparationForce = 3;
	this.SeparationDistance = 400;
	this.SeparationAngle = 120;

	this.AlignmentForce = 3;
	this.AlignmentDistance = 500;
	this.AlignmentAngle = 120;

	this.CenterAttractMode = true;
	this.CenterAttractForce = 3;

	this.Reset = function(){
		init();
	};
	
}


function setup(){

	//Canvas周辺
	createCanvas(windowWidth,windowHeight,WEBGL);
	setAttributes("antialias",true);

	easycam = createEasyCam({distance:windowWidth});
	document.oncontextmenu = function() { return false; }
	document.onmousedown   = function() { return false; }
	console.log(Dw.EasyCam.INFO);

	//GUI関連
	param = new parameters();
	let gui = new dat.GUI();

	gui.addColor(param,"color");
	gui.add(param,"N",5,500,1);
	gui.add(param,"MaxSpeed",1000,2000,10);
	gui.add(param,"minSpeed",0,1000,10);

	let cohesionControl = gui.addFolder("Cohesion");
	cohesionControl.add(param,"CohesionForce",0,30,0.1);
	cohesionControl.add(param,"CohesionDistance",0,1000,1);
	cohesionControl.add(param,"CohesionAngle",0,180,1);
	cohesionControl.open();

	let separationControl = gui.addFolder("Separation");
	separationControl.add(param,"SeparationForce",0,30,0.1);
	separationControl.add(param,"SeparationDistance",0,1000,1);
	separationControl.add(param,"SeparationAngle",0,180,1);
	separationControl.open();


	let alignmentControl = gui.addFolder("Alignment");
	alignmentControl.add(param,"AlignmentForce",0,30,0.1);
	alignmentControl.add(param,"AlignmentDistance",0,1000,1);
	alignmentControl.add(param,"AlignmentAngle",0,180,1);
	alignmentControl.open();

	let centerAttractControl = gui.addFolder("CenterAttract");
	centerAttractControl.add(param,"CenterAttractMode");
	centerAttractControl.add(param,"CenterAttractForce",0,10,0.1);
	//centerAttractControl.open();

	gui.add(param,"Reset");

	pixelDensity(1);
	angleMode(DEGREES);
	init();

}

function init(){

	n = param.N;

	for(let i = 0 ; i < n; ++i){
		boids[i] = new boid();
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	easycam.setViewport([0,0,windowWidth, windowHeight]);
}


function draw(){

	background(0);
	drawBoids();
	updateBoids();

}

function drawBoids(){
	for(let i = 0 ; i < n ; ++i){
		boids[i].drawBody();
	}
}

function updateBoids(){
	
	//ねんのため
	angleMode(DEGREES);

	//tmpForceの初期化
	for(let i = 0; i < n ; ++i){
		tmpForce[i] = createVector(0,0,0);
	}
	for(let i = 0; i < n ; ++i){
		
		let cohesion = [];
		let separation = [];
		let alignment = [];
		//click = [];

		let pos1 = boids[i].copyPosition();
		let vel1 = boids[i].copyVelocity();
		
		//候補抜粋 
		for(let j = 0; j < n ; ++j){

			let pos2 = boids[j].copyPosition();
			let vel2 = boids[j].copyVelocity();
			
			if(i !== j){

				let distance = pos1.dist(pos2);
				let angle = abs(vel1.angleBetween(p5.Vector.sub(pos2,pos1)));
				
				//Cohesion
				if(distance <= param.CohesionDistance && angle <= param.CohesionAngle){
					cohesion.push(pos2);
				}

				//Separation
				if(distance <= param.SeparationDistance && angle <= param.SeparationAngle){
					separation.push(p5.Vector.sub(pos1,pos2));
				}

				//Alignment
				if(distance <= param.AlignmentDistance && angle <= param.AlignmentAngle){
					alignment.push(vel2);
				}
				
				//Click(Attract or Repel)
				
			}
			
		}
		
		//Cohesion
		if(cohesion.length > 0){
			let cohesionForceVector = createVector(0,0,0);
			for(let i = 0 ; i < cohesion.length ; ++i){
				cohesionForceVector.add(cohesion[i]);
			}
			cohesionForceVector.mult(1/cohesion.length);
			cohesionForceVector.sub(pos1);
			cohesionForceVector.mult(param.CohesionForce);
			tmpForce[i].add(cohesionForceVector);
		}

		//Separation
		if(separation.length > 0){
			let separationForceVector = createVector(0,0,0);
			for(let i = 0 ; i < separation.length ; ++i){
				separationForceVector.add(separation[i]);
			}
			separationForceVector.mult(param.SeparationForce);
			tmpForce[i].add(separationForceVector);
		}

		//Alignment
		if(alignment.length > 0){
			alignmentForceVector = createVector(0,0,0);
			for(let i = 0 ; i < alignment.length ; ++i){
				alignmentForceVector.add(alignment[i]);
			}
			alignmentForceVector.mult(1/alignment.length);
			alignmentForceVector.sub(vel1);
			alignmentForceVector.mult(param.AlignmentForce);
			tmpForce[i].add(alignmentForceVector);

			
		}

		//CenterForce
		if(param.CenterAttractMode){
			let centerAttractForceVector = createVector(0,0,0);
			centerAttractForceVector.add(pos1);
			centerAttractForceVector.mult(pos1.mag()-windowWidth/3).mult(-3).div(pos1.mag());
			tmpForce[i].add(centerAttractForceVector);
		}

		//Click
		
	}
	
	for(let i = 0 ; i < n ; ++i){
		boids[i].updatePosition(tmpForce[i]);
		boids[i].limitVelocity();
	}
		

}

class boid {
	
	constructor(){
		this.pos = createVector(random(-windowWidth,windowWidth),random(-windowWidth,windowWidth),random(-windowWidth,windowWidth));
		this.vel = createVector(random(-param.MaxSpeed,param.MaxSpeed),random(-param.MaxSpeed,param.MaxSpeed),random(-param.MaxSpeed,param.MaxSpeed));

	}

	updatePosition(forceVector){
		this.vel.add(forceVector.mult(dt));
		this.pos.add(this.vel.mult(dt));
	}

	copyPosition(){
		return this.pos.copy();
	}

	copyVelocity(){
		return this.vel.copy();
	}

	limitVelocity(){

		if(this.vel.mag() < param.minSpeed){
			this.vel.normalize();
			this.vel.mult(param.minSpeed);
		}
		if(this.vel.mag() > param.MaxSpeed){
			this.vel.normalize();
			this.vel.mult(param.MaxSpeed);
		}
	}

	drawBody(){
		push();
		translate(this.pos.x,this.pos.y,this.pos.z);
		ambientMaterial(param.color);
		noStroke();
		sphere(10);
		//Coneの向きの計算(3次元極座標)
		pop();
	}
}
