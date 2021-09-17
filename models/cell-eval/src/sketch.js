let param;

let leftRedCellPosition = [];
let leftRedCellVelocity = [];
let leftGreenCellPosition = [];
let leftGreenCellVelocity = [];
let rightRedCellPosition = [];
let rightRedCellVelocity = [];
let rightGreenCellPosition = [];
let rightGreenCellVelocity = [];
let firstMethodScore,secondMethodScore,thirdMethodScore;

let noiseX = 0;
let noiseY = 120;

let dt = 1/60; // 1/frameRate();
let t = 0;

function parameters() {

	this.leftMode = "Simple Force";
	this.rightMode = "Random";

	this.radius = 1;
	this.redCellRadius = 10;
	this.greenCellRadius = 50;
	this.greenCellNums = 20;
	this.redCellNums = 100;
	this.noiseAmp = 50;
	this.cehesionForce = 50;
	this.separationForce = 10;
	this.greenMaxInitVelocity = 10;
	this.redMaxInitVelocity = 100;

	this.reset = function() {
		init();
	}
}

function setup() {

	createCanvas(windowWidth,windowHeight);
	param = new parameters();

	background(0);
	init();
	colorMode(RGB);

   // ---------- GUI ----------- //

	let gui = new dat.GUI();

	let cellMovementModeGUI = gui.addFolder("Mode");
	cellMovementModeGUI.add(param,"leftMode",["Simple Force","Position Fixed","Random"]).name("Left");
	cellMovementModeGUI.add(param,"rightMode",["Simple Force","Position Fixed","Random"]).name("Right");
	cellMovementModeGUI.open();

	let evaluationParameterGUI = gui.addFolder("Evaluation Parameters");
	evaluationParameterGUI.add(param,"radius",0,30,0.1).name("Radius");
	evaluationParameterGUI.open();


	let cellParameterGUI = gui.addFolder("Cell Parameters");

	let cellNumberParamterGUI = cellParameterGUI.addFolder("N of Cells");
	cellNumberParamterGUI.add(param,"greenCellNums",0,100,1).name("Green");
	cellNumberParamterGUI.add(param,"redCellNums",0,500,1).name("Red");
	cellNumberParamterGUI.open();

	let cellRadiusParameterGUI = cellParameterGUI.addFolder("Cell Radius");
	cellRadiusParameterGUI.add(param,"redCellRadius",5,30,1).name("Red");
	cellRadiusParameterGUI.add(param,"greenCellRadius",10,200,1).name("Green");
	cellRadiusParameterGUI.open();

	let cellForceParamterGUI = cellParameterGUI.addFolder("Force");
	cellForceParamterGUI.add(param,"noiseAmp",0,100,1).name("Noise Amplitude")
	cellForceParamterGUI.add(param,"cehesionForce",0,100,0.1).name("Cohesion(R-G)");
	cellForceParamterGUI.add(param,"separationForce",0,100,0.1).name("Separation(G-G)");
	cellForceParamterGUI.open();

	let cellInitVelocityGUI = cellParameterGUI.addFolder("Max Init Velocity");
	cellInitVelocityGUI.add(param,"greenMaxInitVelocity",0,100,1).name("Green");
	cellInitVelocityGUI.add(param,"redMaxInitVelocity",0,300,1).name("Red");
	cellInitVelocityGUI.open();

	cellParameterGUI.open();

	gui.add(param,"reset").name("Reset");

}



function draw() {

	t += dt;

	background(0);

    calcEvaluationScores();

	updateCellPositionAndVelocity();

	drawEvaluationScores();

	drawCellPostures();

}

function init() {
	// initialize cell position,velocity
	// green

	let minLimitY = 0;
	let maxLimitY = windowHeight;

	let leftMinLimitX = 0;
	let leftMaxLimitX = windowWidth/3-10;
	
	let rightMinLimitX = windowWidth/3+10;
	let rightMaxLimitX = windowWidth*2/3;

	for(let i=0;i<param.greenCellNums;++i){
		leftGreenCellPosition[i] = createVector(random(leftMinLimitX,leftMaxLimitX),random(minLimitY,maxLimitY));
		rightGreenCellPosition[i] = createVector(random(rightMinLimitX,rightMaxLimitX),random(minLimitY,maxLimitY));

		leftGreenCellVelocity[i] = createVector(random(-param.greenMaxInitVelocity,param.greenMaxInitVelocity),random(-param.greenMaxInitVelocity,param.greenMaxInitVelocity));
		rightGreenCellVelocity[i] = createVector(random(-param.greenMaxInitVelocity,param.greenMaxInitVelocity),random(-param.greenMaxInitVelocity,param.greenMaxInitVelocity));
	}

	// red
	for(let i=0;i<param.redCellNums;i++){
		leftRedCellPosition[i] = createVector(random(leftMinLimitX,leftMaxLimitX),random(minLimitY,maxLimitY));
		rightRedCellPosition[i] = createVector(random(rightMinLimitX,rightMaxLimitX),random(minLimitY,maxLimitY));

		leftRedCellVelocity[i] = createVector(random(-param.redMaxInitVelocity,param.redMaxInitVelocity),random(-param.redMaxInitVelocity,param.redMaxInitVelocity));
		rightRedCellVelocity[i] = createVector(random(-param.redMaxInitVelocity,param.redMaxInitVelocity),random(-param.redMaxInitVelocity,param.redMaxInitVelocity));
	}


}

function calcEvaluationScores(){


}

function updateCellPositionAndVelocity(){

    // ------------------------ LEFT ------------------------ //

	// Force calc, Update velocity
	if(param.leftMode === "Simple Force"){

		// 1 : Red cell random walk based on perlin noise

		for(let i=0;i<leftRedCellVelocity.length;++i){
			let noiseWalk = createVector(param.noiseAmp*(2*noise(noiseX*i,t+i)-1),param.noiseAmp*(2*noise(noiseY*i,t+i)-1));
			leftRedCellVelocity[i].add(noiseWalk);
		}

		// 2 : Cohesion force between green and red
		for(let i=0;i<leftGreenCellPosition.length;++i){
			for(let j=0;j<leftRedCellPosition.length;++j){
				let subVec = p5.Vector.sub(leftGreenCellPosition[i],leftRedCellPosition[j]);
				let vecAmp = param.cehesionForce*exp(-5*Math.pow(subVec.mag()-param.redCellRadius,2));

				// tani bekutoru(j -> i)
				let e = p5.Vector.sub(leftRedCellPosition[j],leftGreenCellPosition[i]).normalize();
				e.mult(vecAmp);
				leftGreenCellVelocity[i].add(e.rotate(PI));
				leftRedCellVelocity[j].add(e);

			}
		}

		// 3 : Separation force between green and green
		
		for(let i=0;i<leftGreenCellPosition.length-1;++i){
			for(let j=i+1;j<leftGreenCellPosition.length;++j){

				let subVec = p5.Vector.sub(leftGreenCellPosition[i],leftGreenCellPosition[j]);
				let vecAmp = param.separationForce/(subVec.magSq());

				// tanni bekutoru (j->i)
				let e = p5.Vector.sub(leftGreenCellPosition[j],leftGreenCellPosition[j]).normalize();

				leftGreenCellVelocity[i].add(e.mult(vecAmp));
				leftGreenCellVelocity[j].add(e.rotate(PI).mult(vecAmp));

			}
		}


	}
	else if(param.leftMode === "Position Fixed"){

		// 1 : Red cell random walk based on perlin noise

		for(let i=0;i<leftRedCellVelocity.length;++i){
			let noiseWalk = createVector(param.noiseAmp*(2*noise(noiseX*i,t+i)-1),param.noiseAmp*(2*noise(noiseY*i,t+i)-1));
			leftRedCellVelocity[i].add(noiseWalk);
		}


		// 2 : Cohesion force between green and red
		for(let i=0;i<leftGreenCellPosition.length;++i){
			for(let j=0;j<leftRedCellPosition.length;++j){
				let subVec = p5.Vector.sub(leftGreenCellPosition[i],leftRedCellPosition[j]);
				let vecAmp = param.cehesionForce*exp(-5*(subVec.mag()-param.redCellRadius)**2);

				// tani bekutoru(j -> i)
				let e = p5.Vector.sub(leftRedCellPosition[j],leftGreenCellPosition[i]).normalize();
				e.mult(vecAmp);
				leftGreenCellVelocity[i].add(e.rotate(PI));
				leftRedCellVelocity[j].add(e);
			}
		}
		// 3 : Green cell position is fixed

		for(let i=0;i<leftGreenCellVelocity.length;++i){
			leftGreenCellVelocity[i] = createVector(0,0);
		}


	}

	// Update Position and Adjustment Position(Periodic Boundary Condition)

	for(let i=0;i<leftGreenCellPosition.length;++i){
		
		leftGreenCellPosition[i] = p5.Vector.add(leftGreenCellPosition[i],leftGreenCellVelocity[i].mult(dt));

		leftGreenCellPosition[i] = positionAdjustment(leftGreenCellPosition[i],"left");

	}

	for(let i=0;i<leftRedCellPosition.length;++i){

		leftRedCellPosition[i] = p5.Vector.add(leftRedCellPosition[i],leftRedCellVelocity[i].mult(dt));

		leftRedCellPosition[i] = positionAdjustment(leftRedCellPosition[i],"left");

	}

	// ------------------------ RIGHT ------------------------ //
	// Force calc, Update velocity
	if(param.rightMode === "Simple Force"){

		// 1 : Red cell random walk based on perlin noise

		for(let i=0;i<rightRedCellVelocity.length;++i){
			let noiseWalk = createVector(param.noiseAmp*(2*noise(noiseX*i,t+i)-1),param.noiseAmp*(2*noise(noiseY*i,t+i)-1));
			rightRedCellVelocity[i].add(noiseWalk);
		}
		// 2 : Cohesion force between green and red

		for(let i=0;i<rightGreenCellPosition.length;++i){
			for(let j=0;j<rightRedCellPosition.length;++j){
				let subVec = p5.Vector.sub(rightGreenCellPosition[i],rightRedCellPosition[j]);
				let vecAmp = param.cehesionForce*exp(-5*(subVec.mag()-param.redCellRadius)**2);

				// tani bekutoru(j -> i)
				let e = p5.Vector.sub(rightRedCellPosition[j],rightGreenCellPosition[i]).normalize();
				e.mult(vecAmp);
				rightGreenCellVelocity[i].add(e.rotate(PI));
				rightRedCellVelocity[j].add(e);
			}
		}

		// 3 : Separation force between green and green

		for(let i=0;i<rightGreenCellPosition.length-1;++i){
			for(let j=i+1;j<rightGreenCellPosition.length;++j){

				let subVec = p5.Vector.sub(rightGreenCellPosition[i],rightGreenCellPosition[j]);
				let vecAmp = param.separationForce/(subVec.magSq());

				// tanni bekutoru (j->i)
				let e = p5.Vector.sub(rightGreenCellPosition[j],rightGreenCellPosition[j]).normalize();

				rightGreenCellVelocity[i].add(e.mult(vecAmp));
				rightGreenCellVelocity[j].add(e.rotate(PI).mult(vecAmp));

			}
		}

	}
	else if(param.rightMode === "Position Fixed"){

		// 1 : Red cell random walk based on perlin noise

		for(let i=0;i<rightRedCellVelocity.length;++i){
			let noiseWalk = createVector(param.noiseAmp*(2*noise(noiseX*i,t+i)-1),param.noiseAmp*(2*noise(noiseY*i,t+i)-1));
			rightRedCellVelocity[i].add(noiseWalk);
		}

		// 2 : Cohesion force between green and red
		for(let i=0;i<rightGreenCellPosition.length;++i){
			for(let j=0;j<rightRedCellPosition.length;++j){
				let subVec = p5.Vector.sub(rightGreenCellPosition[i],rightRedCellPosition[j]);
				let vecAmp = -param.cehesionForce*exp(-5*(subVec.mag()-param.redCellRadius)**2);
				// tani bekutoru(j -> i)
				let e = p5.Vector.sub(rightRedCellPosition[j],rightGreenCellPosition[i]).normalize();

				rightGreenCellVelocity[i].add(e.rotate(PI).mult(vecAmp));
				rightRedCellVelocity[j].add(e.mult(vecAmp));
			}
		}

		// 3 : Green cell position is fixed
		for(let i=0;i<rightGreenCellVelocity.length;++i){
			rightGreenCellVelocity[i] = createVector(0,0);
		}

	}

	// Update Position and Adjustment Position(Periodic Boundary Condition)

	for(let i=0;i<rightGreenCellPosition.length;++i){

		rightGreenCellPosition[i] = p5.Vector.add(rightGreenCellPosition[i],rightGreenCellVelocity[i].mult(dt));

		rightGreenCellPosition[i] = positionAdjustment(rightGreenCellPosition[i],"right");

	}
	for(let i=0;i<rightRedCellPosition.length;++i){

		rightRedCellPosition[i] = p5.Vector.add(rightRedCellPosition[i],rightRedCellVelocity[i].mult(dt));

		rightRedCellPosition[i] = positionAdjustment(rightRedCellPosition[i],"right");

	}

	
}

function positionAdjustment(pos,box){

	let minLimitY = 0;
	let maxLimitY = windowHeight;

	let leftMinLimitX = 0;
	let leftMaxLimitX = windowWidth/3-10;
	
	let rightMinLimitX = windowWidth/3+10;
	let rightMaxLimitX = windowWidth*2/3;

	let tmpVector = pos.copy();

	// left
	if(box === "left"){
		if(tmpVector.x < leftMinLimitX){
			tmpVector.x = leftMaxLimitX;
		}
		else if(tmpVector.x > leftMaxLimitX){
			tmpVector.x = leftMinLimitX;
		}
	}//right
	else{
		if(tmpVector.x < rightMinLimitX){
			tmpVector.x = rightMaxLimitX;
		}
		else if(tmpVector.x > rightMaxLimitX){
			tmpVector.x = rightMinLimitX;
		}
	}
	if(tmpVector.y < minLimitY){
		tmpVector.y = maxLimitY;
	}
	else if(tmpVector.y > maxLimitY){
		tmpVector.y = minLimitY;
	}

	return tmpVector;

}

function drawEvaluationScores(){

}

function drawCellPostures(){

	// ---------- LEFT ---------- //

	strokeWeight(1);
	stroke(30,30,30);

	for(let i=0;i<leftGreenCellPosition.length;++i){
		fill("green");
		circle(leftGreenCellPosition[i].x,leftGreenCellPosition[i].y,param.greenCellRadius);
	}
	for(let i=0;i<leftRedCellPosition.length;++i){
		fill("red");
		circle(leftRedCellPosition[i].x,leftRedCellPosition[i].y,param.redCellRadius);
	}
	strokeWeight(10);
	noFill();
	stroke(255,153,0);
	rect(0,0,windowWidth/3,windowHeight);

	// ---------- RIGHT ----------- //

	strokeWeight(1);
	stroke(30,30,30);

	for(let i=0;i<rightGreenCellPosition.length;++i){
		fill("green");
		circle(rightGreenCellPosition[i].x,rightGreenCellPosition[i].y,param.greenCellRadius);
	}
	for(let i=0;i<rightRedCellPosition.length;++i){
		fill("red");
		circle(rightRedCellPosition[i].x,rightRedCellPosition[i].y,param.redCellRadius);
	}

	strokeWeight(10);
	noFill();
	stroke(153,255,0);
	rect(windowWidth/3+10,0,windowWidth/3,windowHeight);

}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight-7);
}



