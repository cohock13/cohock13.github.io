/* Special Thanks






*/

let easycam,param;
let boids = [];
let tmpForce = [];

//刻み幅
let dt = 0.01;

function parameters(){

	this.color = "rgb(27,232,100)";

	this.N = 20;
	this.minSpeed = 0.1;
	this.MaxSpeed = 0.5;
	
	this.CohesionForce = 0.1;
	this.CohesionDistance = 0.5;
	this.CohesionAngle = 40;

	this.SeparationForce = 0.1;
	this.SeparationDistance = 0.5;
	this.SeparationAngle = 40;

	this.AlignmentForce = 0.1;
	this.AlignmentDistance = 0.5;
	this.AlignmentAngle = 40;

	this.Reset = function(){
		init();
	};
	
}


function setup(){

	//Canvas周辺
	createCanvas(windowWidth,windowHeight,WEBGL);
	setAttributes("antialias",true);

	var initState = {
		distance : 10000,
		center   : [0,0,0],
		rotation : [1,1,0,0],
	};

	easycam = new Dw.EasyCam(p5.RendererGL,initState);

	console.log(Dw.EasyCam.INFO);

	//GUI関連
	param = new parameters();
	let gui = new dat.GUI();

	gui.addColor(param,"color");
	gui.add(param,"N",5,100).step(1);
	gui.add(param,"MaxSpeed",0.1,1,0.001);
	gui.add(param,"minSpeed",0,0.1,0.001);

	let cohesionControl = gui.addFolder("Cohesion");
	cohesionControl.add(param,"CohesionForce",0,1,0.01);
	cohesionControl.add(param,"CohesionDistance",0,1,0.01);
	cohesionControl.add(param,"CohesionAngle",0,180,1);
	cohesionControl.open();

	let separationControl = gui.addFolder("Separation");
	separationControl.add(param,"SeparationForce",0,1,0.01);
	separationControl.add(param,"SeparationDistance",0,1,0.01);
	separationControl.add(param,"SeparationAngle",0,180,1);
	separationControl.open();


	let alignmentControl = gui.addFolder("Alignment");
	alignmentControl.add(param,"AlignmentForce",0,1,0.01);
	alignmentControl.add(param,"AlignmentDistance",0,1,0.01);
	alignmentControl.add(param,"AlignmentAngle",0,180,1);
	alignmentControl.open()

	gui.add(param,"Reset");
	
	angleMode(DEGREES);
	init();

}

function init(){

	for(let i = 0 ; i < param.N ; ++i){
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
	for(let i = 0 ; i < boids.length ; ++i){
		boids[i].drawBody();
	}
}

function updateBoids(){

	//ねんのため
	angleMode(DEGREES);

	//tmpForceの初期化
	for(let i = 0; i < boids.length ; ++i){
		tmpForce[i] = createVector(0,0,0);
	}

	for(let i = 0; i < boids.length ; ++i){

		let cohesion = [];
		let separation = [];
		let alignment = [];
		//click = [];

		let pos1 = boids[i].pos();
		let vel1 = boids[i].vel();

		//候補抜粋 
		for(let j = 0; j < boids.length ; ++j){

			let pos2 = boids[j].pos;
			let vel2 = boids[j].vel;

			let distance = pos1.dist(pos2);
			let angle = abs(vel1.angleBetween(p5.Vector.sub(pos2,pos1)));

			if(i = !j){
				//Cohesion
				if(distance <= param.CohesionDistance && angle <= param.CohesionAngle){
					cohesion.push(pos2);
				}

				//Separation
				if(distance <= param.SeparationDistance && angle <= param.SeparationAngle){
					let tmp = p5.Vector.sub(pos1,pos2)
					separation.push(tmp);
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
			cohesionForceVector.mult(CohesionForce);
			tmpForce[i].add(cohesionForceVector);
		}

		//Separation
		if(separation.length > 0){
			let separationForceVector = createVector(0,0,0);
			for(let i = 0 ; i < separation.length ; ++i){
				separationForceVector.add(separation[i]);
			}
			separationForceVector.mult(SeparationForce)
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
			alignmentForceVector.mult(AlignmentForce);
			tmpForce[i].add(alignmentForceVector);
			
		}
		
		//Click
	}

	for(let i = 0 ; i < boids.length ; ++i){
		boids[i].updatePosition(tmpForce[i]);
	}

}

class boid{

	constructor(){

		this.position = createVector(random(-windowWidth/2,windowWidth/2),random(-windowHeight/2,windowHeight/2),random((windowHeight+windowWidth)/4));
		this.velocity = createVector(random(param.minSpeed,param.MaxSpeed),random(param.minSpeed,param.MaxSpeed),random(param.minSpeed,param.MaxSpeed))
        //this.vel = createVector(random(0,0.1),random(0,0.1),random(0,0.1));
	}

	pos(){
		return this.position;
	}

	vel(){
		return this.velocity;
	}
	updatePosition(v){

		this.velocity.add(v.mult(dt));
		this.position.add(this.vel.mult(dt));

	}

	drawBody(){

		push();
		translate(this.position.x,this.position.y,this.position.z);
		ambientMaterial(param.color);
		noStroke();
		sphere(3);
		//Coneの向きの計算(3次元極座標)
		
		pop();

	}
}