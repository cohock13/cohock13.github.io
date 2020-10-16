/* Special Thanks






*/

let easycam,param;
let pos = [];
let vel = [];
let tmpForce = [];
let n;

//刻み幅
let dt = 0.005;

function parameters(){

	this.color = "rgb(27,232,100)";

	this.N = 20;
	this.minSpeed = 20;
	this.MaxSpeed = 500;
	
	this.CohesionForce = 3;
	this.CohesionDistance = 20;
	this.CohesionAngle = 40;

	this.SeparationForce = 3;
	this.SeparationDistance = 20;
	this.SeparationAngle = 40;

	this.AlignmentForce = 3;
	this.AlignmentDistance = 20;
	this.AlignmentAngle = 40;

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
	gui.add(param,"N",5,200,1);
	gui.add(param,"MaxSpeed",100,700,10);
	gui.add(param,"minSpeed",0,100,1);

	let cohesionControl = gui.addFolder("Cohesion");
	cohesionControl.add(param,"CohesionForce",0,300,0.1);
	cohesionControl.add(param,"CohesionDistance",0,2000,1);
	//cohesionControl.add(param,"CohesionAngle",0,180,1);
	cohesionControl.open();

	let separationControl = gui.addFolder("Separation");
	separationControl.add(param,"SeparationForce",0,3,0.01);
	separationControl.add(param,"SeparationDistance",0,1500,1);
	//separationControl.add(param,"SeparationAngle",0,180,1);
	separationControl.open();


	let alignmentControl = gui.addFolder("Alignment");
	alignmentControl.add(param,"AlignmentForce",0,300,0.1);
	alignmentControl.add(param,"AlignmentDistance",0,2000,1);
	//alignmentControl.add(param,"AlignmentAngle",0,180,1);
	alignmentControl.open();

	gui.add(param,"Reset");

	pixelDensity(1);
	angleMode(DEGREES);
	init();

}

let ttmp = [];
function init(){

	n = param.N;

	for(let i = 0 ; i < n; ++i){
		pos[i] = createVector(random(-windowWidth/3,windowWidth/3),random(-windowWidth/3,windowWidth/3),random(-windowWidth/3,windowWidth/3));
		vel[i] = createVector(random(-1000,1000),random(-1000,1000),random(-1000,1000));
		ttmp[i] = createVector(random(param.minSpeed,param.MaxSpeed),random(param.minSpeed,param.MaxSpeed),random(param.minSpeed,param.MaxSpeed));
	}

	console.log(ttmp);
	console.log(vel);

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
		push();
		translate(pos[i].x,pos[i].y,pos[i].z);
		ambientMaterial(param.color);
		noStroke();
		sphere(10);
		//Coneの向きの計算(3次元極座標)
		
		pop();
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

		let pos1 = pos[i];
		let vel1 = vel[i];
		
		//候補抜粋 
		for(let j = 0; j < n ; ++j){

			let pos2 = pos[j];
			let vel2 = vel[j];
			
			let distance = pos1.dist(pos2);
			//let angle = abs(vel1.angleBetween(p5.Vector.sub(pos2,pos1)));
			
			if(i !== j){
				
				//Cohesion
				if(distance <= param.CohesionDistance){
					cohesion.push(pos2);
				}

				//Separation
				if(distance <= param.SeparationDistance){
					separation.push(p5.Vector.sub(pos1,pos2));
				}

				//Alignment
				if(distance <= param.AlignmentDistance){
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
			separationForceVector.mult(param.Separation);
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
		
		//Click
		
	}
	
	for(let i = 0 ; i < n ; ++i){
		let tmpPos = pos[i];
		let tmpVel = vel[i].copy();

		tmpVel.add(tmpForce[i].mult(dt));
		console.log(vel);
		tmpPos.add(tmpVel.mult(dt));

		/*
		vel[i].add(tmpForce[i].mult(dt));
	
		pos[i].add(tmp.mult(dt));
		*/
	}
		

}
