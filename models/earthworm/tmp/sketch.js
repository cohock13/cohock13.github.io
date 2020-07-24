let param;
let scale_ = 1;
let dt = 0.01;
let pos = [];
let vel = [];
let rts = [];
let len = [];
let x0 = 0;
let y0 = 0;

//GUIにセットするためのパラメータ群
function parameters() {
	this.n = 10;
	this.m = 1;
	this.k = 1;
	this.a = 0.1;
	this.rts = 100;
	this.reset = function() {
		init();
	}
}
//ブラウザ幅が変更された時のキャンバスサイズ変更
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
//マウスホイールで倍率変更
function mouseWheel(event) {
	scale_ -= 0.003*event.delta;
	scale_ = constrain(scale_,0.0001,50);
}
//マウスをドラッグして移動．右上にGUIがあるため右上1/4以外の領域にしてある．
function mouseDragged() {
	if(mouseX <= windowWidth/2 || mouseY >= windowHeight/2){
		x0 += mouseX - pmouseX;
		y0 += mouseY - pmouseY;
	}
}
//初期操作(座標をいったん等間隔に，初速を0にする)
function init(){
	x0 = 0;
	y0 = 0;
	pos = Array(param.n);
	vel = Array(param.n);
	for(let i = 0 ; i < param.n; ++i){
		pos[i] = i*100;
		vel[i] = 0;
	}
}
//setup関数(最初に1度だけ読み込まれる)，GUIの操作など
function setup() {
	createCanvas(windowWidth,windowHeight);
	param = new parameters();
	background(255);
	init();
	gui.add(param,"rts",10,150).step(10);
	gui.add(param,"n",3,100).step(1);
	gui.add(param,"m",1,10).step(0.1);
	gui.add(param,"k",0,10).step(0.1);
	gui.add(param,"a",0,3).step(0.1);
	gui.add(param,"reset");
}
//繰り返し呼ばれる作画関数．translateは中央に座標(0,0)を持っていく操作．
function draw(){
	translate(windowWidth/2+x0,windowHeight/2+y0);
	UpdateLength();
	UpdateRTS();
	UpdatePosition();
	DrawBody();
}
//pos(座標)から質点間の長さを計算．
function UpdateLength(){
	len = Array(pos.length-1);
	for(let i = 0; i < pos.length - 1; ++i){
		len[i] = abs(pos[i]-pos[i+1]);
	}
}
//lenから各質点間のRTSを計算．i=0においてはパラメータ群から参照する．
function UpdateRTS(){
	rts = Array(len.length);
	for(let i = 0; i < rts.length; ++i){
		if(i === 0){
			rts[i] = param.rts;
		}
		else {
			rts[i] = len[i-1];
		}
	}
}
//ルンゲクッタを用いて，座標を更新する．
function UpdatePosition() {
	//Runge-Kutta(4th)
	let h1,h2,h3,h4,k1,k2,k3,k4;
	for(let i = 0 ; i < pos.length; ++i){
		v = vel[i]
		k1 = dt*v;
		h1 = dt*CalcForce(i,v);
		k2 = dt*(v+h1/2);
		h2 = dt*CalcForce(i,v+k1/2);
		k3 = dt*(v+h2/2);
		h3 = dt*CalcForce(i,v+k2/2);
		k4 = dt*(v+h3);
		h4 = dt*CalcForce(i,v+k3);
		vel[i] += (k1+2*k2+2*k3+k4)/6;
		pos[i] += (h1+2*h2+2*h3+h4)/6;
	}
}

//i番目の質点に働く力を返す．
function CalcForce(i,delta){
	if(i === 0){
		return -1*param.k*(len[i]-rts[i]) - param.a/len[i]*delta;
	}
	else if(i === pos.length -1){
		return param.k*(len[i-1]-rts[i-1]) - param.a/len[i-1]*delta;
	}
	else{
		return param.k*(len[i-1]-rts[i-1]) - param.k(len[i]-rts[i]) - param.a/(len[i-1]+len[i])*2*delta;
	}

}
//更新された座標をもとに，ミミズの体を長方形を用いて描く．
function DrawBody() {
	for(let i = 0; i < pos.length - 1; ++i){
		rect(scale_*pos[i],0,scale_*len[i],100*scale_,20*scale_);
	}
}

