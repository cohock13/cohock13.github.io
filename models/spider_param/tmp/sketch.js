let param,gui;

function parameters(){

	// fluid 

	this.c = 0.2;
	this.a = 3;
	this.tau = 0.1;

	// leg

	this.p_tgt_leg = 10;
	this.u_min_leg = 0.1;
	this.u_max_leg = 0.4;

    this.u_

	// pump

	this.p_tgt_pmp = 10;
	this.u_min_pmp = 0.2;
	this.u_max_pmp = 1.2;

	// init condition

	this.u_0_pmp = 1.5;
	this.u_0_leg = 0.3;

	// other

	this.noise_amp = 0.05;
	this.mass = 10;
	this.N = 2;

}

function setup(){

	createCanvas(windowWidth,windowHeight);

	param = new parameters();
	let gui = new dat.GUI();


	let fluidParameterGUI = gui.addFolder("Fluid");
	fluidParameterGUI.add(param,"c",0,5,0.01);
	fluidParameterGUI.add(param,"a",0,5,0.01);
	fluidParameterGUI.add(param,"tau",0,3,0.01);
	fluidParameterGUI.open();


	let legParameterGUI = gui.addFolder("Leg");
	legParameterGUI.add(param,"p_tgt_leg",0,30,0.1);
	legParameterGUI.add(param,"u_min_leg",0,1,0.01);
	legParameterGUI.add(param,"u_max_leg",0,2,0.01);
	legParameterGUI.open();

	let pumpParameterGUI = gui.addFolder("Pump");
	pumpParameterGUI.add(param,"p_tgt_pmp",0,30,0.1);
	pumpParameterGUI.add(param,"u_min_pmp",0,1,0.01);
	pumpParameterGUI.add(param,"u_max_pmp",0,3,0.01);
	pumpParameterGUI.open();

	let initParameterGUI = gui.addFolder("Init Condition");
	initParameterGUI.add(param,"u_0_pmp",0.1,5,0.01);
	initParameterGUI.add(param,"u_0_leg",0.1,1,0.01);
	initParameterGUI.open();

	gui.add(param,"mass",0,10,0.1);
	gui.add(param,"noise_amp",0,0.2,0.01);
	gui.add(param,"N",2,8,2);

}

function draw(){

	clear();
	calcResults();
	drawAllResults();

}

let time = 10;
let step = 5000;

let dt = time/step;
let p = [];
let p_mus = [];
let u = [];
let activated = [];


function calcResults(){

	// init

	for(let i=0;i<param.N+1;++i){
		p[i] = [];
		p_mus[i] = [];
		u[i] = [];
		activated[i] = false;
	}
	for(let i=0;i<param.N+1;++i){
		if(i===0){
			u[i][0] = param.u_0_pmp;
			p[i][0] = param.a*u[i][0];
			p_mus[i][0] = 0;
		}
		else{
			u[i][0] = param.u_0_leg + 0.001*i;
			p[i][0] = param.a*u[i][0];
			p_mus[i][0] = 0;
		}
	}

	for(let t=1;t<step;++t){
		for(let i=0;i<param.N+1;++i){;
			let up_delta = calcDelta(i,t);

			p_mus[i][t] = p_mus[i][t-1]+dt*up_delta[0];
			u[i][t] = u[i][t-1]+dt*up_delta[1];
			p[i][t] = p_mus[i][t] + param.a*u[i][t];
		} 
	}
}

function calcDelta(num,t){

    let u_tmp = 0;
	let p_tmp = 0;

	// du update

	// pump
	if(num===0){
		for(let i=1;i<param.N+1;++i){
			u_tmp += param.c*(p[i][t-1]-p[num][t-1]);
		}
	}
	// leg
	else{
		u_tmp = param.c*(p[0][t-1]-p[num][t-1]);
	}



	// dp update

	let p_tgt;

	if(num===0){
		p_tgt = controlActivation(num,t,param.p_tgt_pmp,param.u_min_pmp,param.u_max_pmp);
	}
	else{
		p_tgt = controlActivation(num,t,param.p_tgt_leg,param.u_min_leg,param.u_max_leg);
	}
	
	p_tmp = 1/param.tau*(p_tgt-p_mus[num][t-1]);

	return [u_tmp,p_tmp];
}

function controlActivation(num,t,p_tgt,u_min,u_max){
	
	let p_target = 0;

	if(activated[num]){
		if(u[num][t-1] < u_min){
			activated[num] = false;
		}
		else{
			p_target = p_tgt;
		}
	}
	else{
		if(u[num][t-1] > u_max){
			activated[num] = true;
			p_target = p_tgt;
		}
	}
	return p_target;

}

function drawAllResults(){

	drawResults(1,0,0);

	/*
	drawResults(3,0,1);
	drawResults(5,1,0);
	drawResults(7,1,1);
	*/

	line(0,windowHeight/2,windowWidth,windowHeight/2);
	line(0.4*windowWidth,0,0.4*windowWidth,windowHeight);


}

function drawResults(num,posNumX,posNumY){

	// num

	let xCalib = posNumX*windowWidth*0.4;
	let yCalib = posNumY*windowHeight/2;

	let xWidth = windowWidth*0.4;
	let yWidth = windowHeight/2;

	for(let i=0;i<step-1;++i){
		let x1 = xCalib+xWidth*i/step;
		let y1 = yCalib+(param.u_max_leg*1.2-u[num][i])/param.u_max_leg*yWidth;
		let x2 = xCalib+xWidth*(i+1)/step;
		let y2 = yCalib+(param.u_max_leg*1.2-u[num][i+1])/param.u_max_leg*yWidth;

		line(x1,y1,x2,y2);
	}

	// num+1

}


function windowResized() {

	resizeCanvas(windowWidth, windowHeight*0.9);

}
