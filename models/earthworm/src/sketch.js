let param;
let scale_ = 1;
let dt = 0.05;
let pos = [];
let vel = [];
let rts = [];
let len = [];
let x0 = 0;
let y0 = 0;

//GUIにセットするためのパラメータ群
//aはa/m，kはk/mです．OVモデルよろしくパラメータがシビアなので固定しています．
function parameters() {
	this.n = 10;
	this.a = 20;
	this.k = 0.02;
	this.rts = 50;
	this.reset = function() {
		init();
	}
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

//setup関数(最初に1度だけ読み込まれる)，GUIの操作など
function setup() {
	createCanvas(windowWidth,windowHeight*0.95);
	param = new parameters();
	init();
	let gui = new dat.GUI();
	gui.add(param,"rts",30,70).step(0.5);
	gui.add(param,"n",4,30).step(1);
	gui.add(param,"reset");
}

//初期操作(座標をいったん等間隔に，初速を0にする．画面関係のパラメータもリセット)
function init(){
	background(12);
	scale_ = 1;
	x0 = 0;
	y0 = 0;
	pos = Array(param.n);
	vel = Array(param.n);
	for(let i = 0 ; i < param.n; ++i){
		pos[i] = (param.n/2-i)*50;
		vel[i] = 0;
	}
}

//繰り返し呼ばれる作画関数．translateは中央に座標(0,0)を持っていく操作．
function draw(){
		clear();
		background(12);
		translate(windowWidth/2+x0,windowHeight/2+y0);

		UpdateLength();
		UpdateRTS();
		DrawBody();
		UpdatePosition();

		noStroke();	
		fill(255)
		textSize(20);
		text("進んだ距離："+str(round(pos[0]-pos.length*25)),-windowWidth*0.5+windowWidth*0.07,-windowHeight*0.5+windowHeight*0.15);
}

//pos(座標)から質点間の長さを計算．
function UpdateLength(){
	len = Array(pos.length-1);
	for(let i = 0; i < pos.length - 1; ++i){
		len[i] = pos[i]-pos[i+1];
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
		pos[i] += (k1+2*k2+2*k3+k4)/6;
		vel[i] += (h1+2*h2+2*h3+h4)/6;
	}
}

//i番目の質点に働く力を返す．
function CalcForce(i,delta){
	if(i === 0){
		return -param.k*(len[i]-param.rts) - param.a/len[i]*delta;
	}
	else if(i === pos.length -1){
		return param.k*(len[i-1]-rts[i-1]) - param.a/len[i-1]*delta;
	}
	else{
		return param.k*(len[i-1]-rts[i-1]) - param.k*(len[i]-rts[i]) - param.a/(len[i-1]+len[i])*2*delta;
	}

}
//更新された座標をもとに，ミミズの体を長方形を用いて描く．
function DrawBody() {
	for(let i = 0; i < pos.length-1; ++i){
		if(i === 1){
			fill(color(240,128,128));
			stroke(100);
			rect(scale_*(pos[i]-len[i]),scale_*(-5),scale_*len[i],60*scale_,5*scale_);
		}
		else{
			fill(color(255,182,193));
			stroke(100);
			rect(scale_*(pos[i]-len[i]),0,scale_*len[i],50*scale_,5*scale_);
		}
		//rect(scale_*pos[i],0,scale_*len[i],50*scale_,20*scale_);
	}
}

