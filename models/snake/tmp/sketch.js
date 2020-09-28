//スケールなど
let param;
let scale_ = 1;
let dt = 0.05;
let x0 = 0;
let y0 = 0;
let pos = [];//位置
let vel = [];//速度
let k,h;


//GUIにセットするためのパラメータ群
function parameters() {
	this.n = 10;
	this.r = 0;
	this.rts = 50;
	this.reset = function() {
		init();
	}
}


//setup関数(最初に1度だけ読み込まれる)，GUIの操作など
function setup() {
	createCanvas(windowWidth,windowHeight*0.95);
	param = new parameters();
	init();
	let gui = new dat.GUI();
	gui.add(param,"rts",30,70).step(0.5);
	gui.add(param,"r",0,0.1).step(0.001).listen();
	gui.add(param,"n",4,30).step(1);
	gui.add(param,"reset");
}

//初期操作(座標をいったん等間隔に，初速を0にする．画面関係のパラメータもリセット)
function init(){

	//背景や倍率の設定
	background(12);
	scale_ = 1;
	x0 = 0;
	y0 = 0;


	//位置と速度の配列
	pos = new Array(param.n);
	vel = new Array(param.n);
	for(let i = 0; i < param.n; ++i){
		pos[i] = new Array(2).fill(0);
		vel[i] = new Array(2).fill(0);
		pos[i][1] = 50*(param.n-i);
		}
	}

	//ルンゲクッタ用
	k = new Array(pos.length);
	h = new Array(pos.length);
	for(let i = 0; i < pos.length; ++i){
		k[i] = new Array(5);
		h[i] = new Array(5);
		for(let j = 0; j < 5;++j){
			k[j] = new Array(2).fill(0);
			h[j] = new Array(2).fill(0);
		}
	}

}

//繰り返し呼ばれる作画関数．
function draw(){

	    //背景の設定
		SetBackground();

		//座標を計算する
		DrawBody();
		UpdatePosition();
}


//座標と速度を更新する．
function UpdatePosition() {
	//Runge-Kutta(4th)
	v = vel[i]
	//k1~k4の計算
	for(let i = 0 ; i < pos.length; ++i){
		f = CalcForce(i,1);
		k[i][1][0] = dt*f[0];
		k[i][1][1] = dt*f[1];
		h[i][1][0] = dt*v[0];
		h[i][1][1] = dt*v[1];
	}
	for(let i = 0 ; i < pos.length; ++i){
		f = CalcForce(i,2);
		k[i][2][0] = dt*f[0];
		k[i][2][1] = dt*f[1];
		h[i][2][0] = dt*(v[0]+k[i][1][0]/2);
		h[i][2][1] = dt*(v[1]+k[i][1][1]/2);
	}
	for(let i = 0 ; i < pos.length; ++i){
		f = CalcForce(i,3);
		k[i][3][0] = dt*f[0];
		k[i][3][1] = dt*f[1];
		h[i][3][0] = dt*(v[0]+k[i][2][0]/2);
		h[i][3][1] = dt*(v[1]+k[i][2][1]/2);
	}
	for(let i = 0 ; i < pos.length; ++i){
		f = CalcForce(i,4);
		k[i][4][0] = dt*f[0];
		k[i][4][1] = dt*f[1];
		h[i][4][0] = dt*(v[0]+k[i][3][0]);
		h[i][4][1] = dt*(v[1]+k[i][3][1]);
	}
	for(let i = 0 ; i < pos.length; ++i){
		pos[i][0] += (k[i][1][0]+2*k[i][2][0]+2*k[i][3][0]+k[i][4][0])/6;
		pos[i][1] += (k[i][1][1]+2*k[i][2][1]+2*k[i][3][1]+k[i][4][1])/6;
		vel[i][0] += (h[i][1][0]+2*h[i][2][0]+2*h[i][3][0]+h[i][4][0])/6;
		vel[i][1] += (h[i][1][1]+2*h[i][2][1]+2*h[i][3][1]+h[i][4][1])/6;
	}

}

//i番目の質点に働く力を返す．
function CalcForce(i,j){
	//CalcBodyForce() ばねダンパにおける力
	//CalcTorqueForce() トルクの力
	//CalcFrictionForce() 摩擦力
	return CalcBodyForce(i,j) + CalcTorqueForce(i,j) + CalcFrictionForce(i,j);
}

function CalcBodyForce(i,j){

}

function CalcTorqueForce(i,j){

}

function CalcFrictionForce(i,j){

}

//更新された座標をもとに，蛇の体を描く．
function DrawBody() {

	strokeJoin(ROUND);
	strokeWeight(10);
	stroke(124,252,0);
	for(let i = 0; i < pos.length-1; ++i){
		line(pos[i][0],pos[i][1],pos[i+1][0],pos[i+1][1]);
	}
}

function SetBackground(){
	clear();
	background(12);
	translate(windowWidth/2+x0,windowHeight/2+y0);
}


//ブラウザ幅が変更された時のキャンバスサイズ変更
function windowResized() {
    resizeCanvas(windowWidth, windowHeight*0.95);
}
//マウスホイールで倍率変更
function mouseWheel(event) {
	scale_ -= 0.0002*event.delta;
	scale_ = constrain(scale_,0.0001,50);
}
//マウスをドラッグして移動．右上にGUIがあるため右上1/4以外の領域にしてある．
function mouseDragged() {
	if(mouseX <= windowWidth/2 || mouseY >= windowHeight/2){
		x0 += mouseX - pmouseX;
		y0 += mouseY - pmouseY;
	}
}
