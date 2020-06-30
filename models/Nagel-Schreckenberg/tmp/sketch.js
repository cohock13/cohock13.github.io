/*
Special Thanks
https://p5js.org/examples/simulate-wolfram-ca.html
*/
let cells;
let param;
let velocity;
let index;
function paramters() {
  this.w = 5;
  this.width_ = 10;
  this.generation = 0;
  this.v_max = 2;
  this.p = 0;
  this.reset = function() {
    init();
    clear();
    background(255);
  }
}

function init(){
  param.w = param.width_;
  cells = Array(floor(windowWidth/param.w));
  //要素が2以下だと後で困るので
  cells[0] = 1;
  cells[floor(cells.length/2)] = 1;
  //乱数でcellsの01を決定
  for(let i = 0;i < cells.length;++i){
    cells[i] = Math.round(random(min(0.5+0.1*param.w,0.7)));
  }
  index = Array();
  velocity = Array();
  //cellsの1の部分のindexを取る､|vel|=|index|
  for(let i = 0;i < cells.length; ++i){
    if(cells[i] === 1){
      append(index,i);
      append(velocity,0);
    }
  }
  param.generation = 0;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight*0.95);
}

function setup() {
  createCanvas(windowWidth,windowHeight*0.95);
  colorMode(RGB);
  background(255);
  param = new paramters();
  init();
  let gui = new dat.GUI();
  gui.add(param,"width_",0.5,10).step(0.5);
  gui.add(param,"v_max",0,10).step(1);
  gui.add(param,"p",0,1).step(0.1);
  gui.add(param,"reset");
}

function draw() {
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === 1) {
      fill(0);
    } 
    else{
      fill(40);
      noStroke();
      rect(i * param.w, param.generation*param.w, param.w, param.w);
    }
  }
  if (param.generation < windowHeight*0.95/param.w) {
    update_cells();
  }
}

function update_cells() {
  for(let i = 0; i < len.cells;++i){
    cells[i] = 0;
  }
  let len = velocity.length;
  let dist = Array(len);
  //dist配列を計算
  for(let i = 0; i < len; ++i){
    if(i === len-1){
      append(dist,(len-index[i]-1+len[0]));
    }
    else{
      append(dist,index[i+1]-index[i]);
    }
  }
  //vの更新
  for(let i = 0; i < len; ++i){
    let v = min(param.v_max,velocity[i]+1);
    v = min(v,dist[i]-1);
    let p_ = random();
    if(p_ < param.p){
      v = max(v-1,0);
    }
    
    if(index[i]+v < len){
      index[i] += v;
    }
    else{
      index[i] += v - len;
    }
    velocity[i] = v;
  }

  for(let i = 0; i < len ; ++i){
    cells[index[i]] = 1;
  }
}