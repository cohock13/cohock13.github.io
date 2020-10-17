/* Special Thanks
https://p5js.org/reference/#content
https://www.openprocessing.org/sketch/385960
https://www.dynamicmath.xyz/#about

*/

let easycam,param;
let boids = [];
let n;

//刻み幅
let dt = 0.005;

function parameters(){

	this.color = "rgb(27,232,100)";

	this.N = 100;
	this.minSpeed = 500;
	this.maxSpeed = 1500;
	
	this.cohesionForce = 5;
	this.cohesionDistance = 700;
	this.cohesionAngle = 120;

	this.separationForce = 3;
	this.separationDistance = 150;
	this.separationAngle = 120;

	this.alignmentForce = 5;
	this.alignmentDistance = 600;
	this.alignmentAngle = 120;

	this.centerAttractMode = true;
	this.centerAttractForce = 3;

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
	gui.add(param,"N",5,1000,1);
	gui.add(param,"maxSpeed",1000,2000,10);
	gui.add(param,"minSpeed",0,1000,10);

	let cohesionControl = gui.addFolder("Cohesion");
	cohesionControl.add(param,"cohesionForce",0,30,0.1).name("Force");
	cohesionControl.add(param,"cohesionDistance",0,1000,1).name("Distance");
	cohesionControl.add(param,"cohesionAngle",0,180,1).name("Angle");
	cohesionControl.open();

	let separationControl = gui.addFolder("Separation");
	separationControl.add(param,"separationForce",0,30,0.1).name("Force");
	separationControl.add(param,"separationDistance",0,1000,1).name("Distance");
	separationControl.add(param,"separationAngle",0,180,1).name("Angle");
	separationControl.open();


	let alignmentControl = gui.addFolder("Alignment");
	alignmentControl.add(param,"alignmentForce",0,30,0.1).name("Force");
	alignmentControl.add(param,"alignmentDistance",0,1000,1).name("Distance");
	alignmentControl.add(param,"alignmentAngle",0,180,1).name("Angle");
	alignmentControl.open();

	let centerAttractControl = gui.addFolder("CenterAttract");
	centerAttractControl.add(param,"centerAttractMode").name("AttractMode");
	centerAttractControl.add(param,"centerAttractForce",0,30,0.1).name("Force");
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
	let tmpForce = [];
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
				if(distance <= param.cohesionDistance && angle <= param.cohesionAngle){
					cohesion.push(pos2);
				}

				//Separation
				if(distance <= param.separationDistance && angle <= param.separationAngle){
					separation.push(p5.Vector.sub(pos1,pos2));
				}

				//Alignment
				if(distance <= param.alignmentDistance && angle <= param.alignmentAngle){
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
			cohesionForceVector.mult(param.cohesionForce);
			tmpForce[i].add(cohesionForceVector);
		}

		//Separation
		if(separation.length > 0){
			let separationForceVector = createVector(0,0,0);
			for(let i = 0 ; i < separation.length ; ++i){
				separationForceVector.add(separation[i]);
			}
			separationForceVector.mult(param.separationForce);
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
			alignmentForceVector.mult(param.alignmentForce);
			tmpForce[i].add(alignmentForceVector);

			
		}
		
		//CenterForce
		if(param.centerAttractMode){
			let centerAttractForceVector = createVector(0,0,0);
			centerAttractForceVector.add(pos1);
			centerAttractForceVector.mult(pos1.mag()-windowWidth/6).mult(-3).div(pos1.mag());
			tmpForce[i].add(centerAttractForceVector);
		}

		//Click
		
	}
	

	for(let i = 0 ; i < n ; ++i){
		//boids[i].updatePosition(tmpForce[i]);
		boids[i].updatePosition(tmpForce[i]);
		boids[i].limitVelocity();
	}
	
		

}

class boid {
	
	constructor(){

		let max = param.maxSpeed;
		this.pos = createVector(random(-windowWidth,windowWidth),random(-windowWidth,windowWidth),random(-windowWidth,windowWidth));
		this.vel = createVector(random(-max,max),random(-max,max),random(-max,max));

	}

	updatePosition(forceVector){
		console.log(this.vel);
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
		if(this.vel.mag() > param.maxSpeed){
			this.vel.normalize();
			this.vel.mult(param.maxSpeed);
		}
	}

	drawBody(){
		push();
		translate(this.pos.x,this.pos.y,this.pos.z);
		fill(param.color);
		//向きの計算(3次元極座標)
		let angleY = atan2(this.vel.x,this.vel.z)+90;
		let angleZ = atan2(this.vel.y,this.vel.x)+90;
		rotateZ(angleZ);
		rotateY(angleY);
		//cone(10,30);
		beginShape(TRIANGLES);
		vertex(0,-20*2,0);
		vertex(-20,20*2,0);
		vertex(20,20*2,0);
		endShape();
		pop();
	}
}