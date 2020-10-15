//スケールなど
let param;
let scale_ = 1;
let dt = 0.05;
let x0 = 0;
let y0 = 0;
let pos = [];//位置
let vel = [];//速度
let k,h;


//ばね定数などのパラメータ．GUIには入れないことにしました
let k1 = 0.1;
let c1 = 0.1;


//GUIにセットするためのパラメータ群
function parameters() {
	this.n = 10;
	this.bodyLength = 50;
	this.headAngle = 0;
	this.mu_t = 0.3;
	this.mu_n = 0.4;
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
	gui.add(param,"angleMode",["sinWave","sawtoothWave","manual"])
	gui.add(param,"headAngle",-45,45).step(1).listen();
	gui.add(param,"bodyLength",1,10).step(0.1);
	gui.add(param,"n",4,30).step(1);
	gui.add(param,"mu_t",0,2).step(0.1);
	gui.add(param,"mu_n",0,2).step(0.1);
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
		pos[i] = createVector(0,0);
		vel[i] = createVector(0,0);
		pos[i].y = param.bodyLength*(param.n-i);
		}
	}

	//ルンゲクッタ用
	k = new Array(pos.length);
	h = new Array(pos.length);
	for(let i = 0; i < pos.length; ++i){
		k[i] = new Array(5);
		h[i] = new Array(5);
		for(let j = 0; j < 5;++j){
			k[i][j] = createVector(0,0);
			h[i][j] = createVector(0,0);
		}
	}
}

//繰り返し呼ばれる作画関数．
function draw(){

	    //背景の設定
		setBackground();

		//座標を計算する
		drawBody();
		updatePosition();
}


//座標(と速度)を更新する．
function updatePosition() {
	//Runge-Kutta(4th)

	/*
	ライブラリに使用しているVectorは以下のように演算をしています．
	v1 += v2  -> v1.add(v2);
	v1 *= a -> v1.mult(a);
	v3 = v1 + v2 -> v3 = p5.Vector.add(v1,v2);
	v3 = v1・v2 -> v3 = p5.Vector.dot(v1,v2);
	*/

	//k1~k4,h1~h4の計算
	v = vel[i];
	for(let i = 0 ; i < pos.length; ++i){
		k[i][1] = calcForce(i,1);
		h[i][1] = v;
	}
	for(let i = 0 ; i < pos.length; ++i){
		k[i][2] = calcForce(i,2);
		h[i][2] = p5.Vector.add(v,k[i][1].mult(0.5));
	}
	for(let i = 0 ; i < pos.length; ++i){
		k[i][3] = calcForce(i,3);
		h[i][3] = p5.Vector.add(v,k[i][2].mult(0.5));
	}
	for(let i = 0 ; i < pos.length; ++i){
		k[i][4] = calcForce(i,4);
		h[i][4] = p5.Vector.add(v,k[i][3]);
	}
	//位置と速度の更新
	for(let i = 0 ; i < pos.length; ++i){
		pos[i].add((k[i][1].add(k[i][2].mult(2).add(k[i][3].mult(2),add(k[i][4])))).mult(dt/6));
		vel[i].add((h[i][1].add(h[i][2].mult(2).add(h[i][3].mult(2),add(h[i][4])))).mult(dt/6));
	}

}


//i番目の質点に働く力を返す．
function calcForce(i,j){

	//ルンゲクッタ用
	let p = 1;
	if(j === 2 || j === 3){
		p = 0.5;
	}

	//あらかじめ単位ベクトルを計算しておく
	calcEtVector();
	calcEnVector();

	//CalcBodyForce() ばねダンパにおける力
	//CalcTorqueForce() トルクの力
	//CalcFrictionForce() 摩擦力
	return p5.Vector.add(calcBodyForce(i,j,p).add(calcTorqueForce(i,j,p).add(calcFrictionForce(i,j,p))));
}

function calcBodyForce(i,j,p){

	let frontForce = createVector(0,0);
	let backForce = createVector(0,0);

	if(i === 0){
		return
	}
	else if(i === pos.length-1){
		return 
	}
	else{
		return 
	}

}

function calcTorqueForce(i,j,p){
	
	//トルクの計算
	torque = calcTorque(i,j,p);
	//長さの計算
	len = calcLength(i,j,p);

	if(i === 0){
		return p5.Vector.mult(enVector1[i],torque[i+1]/len[i]);
	}
	else if(i === 1){
		return p5.Vector.add(enVector1[i-1].mult(-torque[i]/len[i-1]),enVector1[i].mult((torque[i+1]-torque[i])/len[i]));
	}
	else if(i === pos.length-2){
		return p5.Vector.add(enVector1[i-1].mult((torque[i-1]-torque[i])/len[i-1]),enVector1[i].mult(-torque[i]/len[i]))
	}
	else if(i === pos.length-1){
		return p5.Vector.mult(enVector1[i-1],torque[i-1]/len[i-1]);
	}
	else{
		return p5.Vector.add(enVector1[i-1].mult((torque[i-1]-torque[i])/len[i-1]),enVector1[i].mult((torque[i+1]-torque[i])/len[i]));
	}
}

function calcTorque(i,j,p){

}

function calcLength(i,j,p){

}

function calcFrictionForce(i,j,p){

	//体軸接線,法線方向のベクトルを計算
	calcFrictionEtVector();
	calcFrictionEnVector();

	let ft = -param.mu_t*(p5.Vector.dot(vel[i].add(k[i][j-1].mult(p)),etVector2[i]));
	let fn = -param.mu_n*(p5.Vector.dot(vel[i].add(k[i][j-1].mult(p)),enVector2[i]));

	return p5.Vector.add(etVector2[i].mult(ft),enVector2[i].mult(fn));
	

}

//単位ベクトル計算部分 Vector1は質点間，Vector2は質点のベクトルです
/*
 正規化：normalize();
 回転：rotate();
*/
function calcEnVector(){

}

function calcEtVector(){

}

function calcFrictionEnVector(){

}

function calcFrictionEtVector(){

}

//更新された座標をもとに，蛇の体を描く．
function drawBody() {

	strokeJoin(ROUND);
	strokeWeight(10);
	stroke(124,252,0);
	for(let i = 0; i < pos.length-1; ++i){
		line(pos[i].x,pos[i].y,pos[i+1].x,pos[i+1].y);
	}
}

function setBackground(){
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
