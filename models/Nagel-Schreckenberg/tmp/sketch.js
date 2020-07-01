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
  this.width_ = 5;
  this.generation = 0;
  this.v_max = 5;
  this.p = 0.5;
  this.cars = 100;
  this.reset = function() {
    clear();
    init();
    background(255);
  }
}

function init(){
  param.w = param.width_;
  cells = Array(floor(windowWidth/param.w));
  init_cells();
  index = [];
  velocity = [];
  //cellsの1の部分のindex(0-based)を取る､|vel|=|index|
  for(let i = 0;i < cells.length; ++i){
    if(cells[i] === 1){
      index.push(i);
      velocity.push(0);
    }
  }
  param.generation = 0;
}

function init_cells() {
  let l = cells.length;
  for(let i = 0 ; i < l ; ++i){
    cells[i] = 0;
  }
  //ランダムに初期位置を決定
  let n = min(param.cars,l);
  let index = [];

  for(let i = 0; i < l ; ++i){
    index[i] = i;
  }
  for(let i = 0; i < l ; ++i){
    let rnd = Math.floor(random()*(i+1));
    let tmp = index[i];
    index[i] = index[rnd];
    index[rnd] = tmp;
  }
  for(let i = 0; i < n ; ++i){
    cells[index[i]] = 1;
  }
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
  gui.add(param,"width_",0.5,10).step(1);
  gui.add(param,"cars",2,500).step(1);
  gui.add(param,"v_max",0,15).step(1);
  gui.add(param,"p",0,1).step(0.05);
  gui.add(param,"reset");
}

function draw() {
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === 1) {
      fill(230);
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
  let tmp = Array(cells.length);
  for(let i = 0; i < cells.length; ++i){
    tmp[i] = 0;
  }
  index = [];
  for(let i = 0;i < cells.length; ++i){
    if(cells[i] === 1){
      index.push(i);
    }
  }
  let len = velocity.length;
  let len_c = cells.length;
  let dist = Array(len);
  //dist配列を計算
  for(let i = 0; i < len; ++i){
    if(i === len-1){
      dist[i] = len_c-index[i]+index[0];
    }
    else{
      dist[i] = index[i+1]-index[i];
    }
  }
  //vの更新
  for(let i = 0; i < len; ++i){
    let v = min(param.v_max,velocity[i]+1);
    v = min(v,dist[i]-1);
    if(random() < param.p){
      v = max(v-1,0);
    }

    index[i] = (index[i]+v)%len_c;
    
    velocity[i] = v;
  }

  for(let i = 0; i < len ; ++i){
    tmp[index[i]] = 1;
  }

  cells = tmp;
  param.generation++;
}