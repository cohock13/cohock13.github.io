let param;
let scale_ = 1;
let dt = 0.05;
let pos = [];
let k;
let x0 = 0;
let y0 = 0;

//GUIにセットするためのパラメータ群
function parameters() {
	this.n = 10;
	this.r = 0;
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
	gui.add(param,"r",0,0.1).step(0.001).listen();
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
	for(let i = 0 ; i < param.n; ++i){
		pos[i] = (param.n/2-i)*50;
	}

	//ルンゲクッタ用
	k = new Array(pos.length);
	for(let i = 0; i < pos.length; ++i){
		k[i] = new Array(5);
		k[i][0] = 0;
	}

}

//繰り返し呼ばれる作画関数．translateは中央に座標(0,0)を持っていく操作．
function draw(){
		clear();
		background(12);
		translate(windowWidth/2+x0,windowHeight/2+y0);

		DrawBody();
		UpdatePosition();

		noStroke();	
		fill(255)
		textSize(20);
		text("進んだ距離："+str(round(pos[0]-pos.length*25)),-windowWidth*0.5+windowWidth*0.07,-windowHeight*0.5+windowHeight*0.15);
}

//ルンゲクッタを用いて，座標を更新する．
function UpdatePosition() {
	//Runge-Kutta(4th)

	//k1~k4の計算
	for(let i = 0 ; i < pos.length; ++i){
		k[i][1] = dt*CalcForce(i,1);
	}
	for(let i = 0 ; i < pos.length; ++i){
		k[i][2] = dt*CalcForce(i,2);
	}
	for(let i = 0 ; i < pos.length; ++i){
		k[i][3] = dt*CalcForce(i,3);
	}
	for(let i = 0 ; i < pos.length; ++i){
		k[i][4] = dt*CalcForce(i,4);
	}
	for(let i = 0 ; i < pos.length; ++i){
		pos[i] += (k[i][1]+2*k[i][2]+2*k[i][3]+k[i][4])/6;
	}

}

//i番目の質点に働く力を返す．
function CalcForce(i,j){

	//ルンゲクッタの係数．k2とk3で/2する用 
	let p = 1;

	if(j === 2 || j === 3){
		p = 0.5
	}

	if(i === 0){

		let l_back = pos[i]-pos[i+1]+p*k[i][j-1]-p*k[i+1][j-1];

		return -param.r*l_back*(l_back-param.rts);

	}
	else if(i === 1){

		let l_front = pos[i-1]-pos[i]+p*k[i-1][j-1]-p*k[i][j-1];
		let l_back = pos[i]-pos[i+1]+p*k[i][j-1]-p*k[i+1][j-1];
		let rts_back = l_front;

		return param.r*(l_front+l_back)/2*(l_front-param.rts-l_back+rts_back);

	}
	else if(i === pos.length -1){

		let l_front = pos[i-1]-pos[i]+p*k[i-1][j-1]-p*k[i][j-1];
		let rts_front = pos[i-2]-pos[i-1]+p*k[i-2][j-1]-p*k[i-1][j-1];

		return param.r*l_front*(l_front-rts_front);

	}
	else{

		let l_front = pos[i-1]-pos[i]+p*k[i-1][j-1]-p*k[i][j-1];
		let rts_front = pos[i-2]-pos[i-1]+p*k[i-2][j-1]-p*k[i-1][j-1];
		let l_back = pos[i]-pos[i+1]+p*k[i][j-1]-p*k[i+1][j-1];
		let rts_back = l_front;

		return param.r*(l_front+l_back)/2*(l_front-rts_front-l_back+rts_back);

	}

}
//更新された座標をもとに，ミミズの体を長方形を用いて描く．
function DrawBody() {
	for(let i = 0; i < pos.length; ++i){
		strokeWeight(10);
		if(i === 1){
			fill(color(240,128,128));
			stroke(100);
			//rect(scale_*(2*pos[i+1]-pos[i]),scale_*(-5),scale_*(pos[i]-pos[i+1]),60*scale_,5*scale_);
			line(pos[i],scale_*-5,pos[i],-5*scale_);

		}
		else{
			fill(color(255,182,193));
			stroke(100);
			//rect(scale_*(2*pos[i+1]-pos[i]),0,scale_*(pos[i]-pos[i+1]),50*scale_,5*scale_);
			line(pos[i],scale_*-5,pos[i],-5*scale_);
		}
		//rect(scale_*pos[i],0,scale_*len[i],50*scale_,20*scale_);
	}
}

