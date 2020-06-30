/*
Special Thanks
https://p5js.org/examples/simulate-wolfram-ca.html
*/
let cells;
let param;

let ruleset = [0, 1, 0, 1, 1, 0, 1, 0];

function paramters() {
  this.w = 10;
  this.width_ = 10;
  this.generation = 0;
  this.reset = function() {
    init();
    clear();
    background(230);
  }
}

function init(){
  param.w = param.width_;
  cells = Array(floor(windowWidth/param.w));
  //乱数でcellsの01を決定
  for(let i = 0;i < cells.length;++i){
    cells[i] = Math.round(random());
  }
  param.generation = 0;

  //clear();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight*0.9);
}

function setup() {
  createCanvas(windowWidth,windowHeight*0.9);
  colorMode(RGB);
  background(230);
  param = new paramters();
  init();
  let gui = new dat.GUI();
  gui.add(param,"width_",0.5,10).step(0.5);
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
  if (param.generation < windowHeight*0.9/param.w) {
    generate();
  }
}

// The process of creating the new generation
function generate() {
  // First we create an empty array for the new values
  let nextgen = Array(cells.length);
  // For every spot, determine new state by examing current state, and neighbor states
  // Ignore edges that only have one neighor
  for (let i = 1; i < cells.length-1; i++) {
    let left   = cells[i-1];   // Left neighbor state
    let me     = cells[i];     // Current state
    let right  = cells[i+1];   // Right neighbor state
    nextgen[i] = rules(left, me, right); // Compute next generation state based on ruleset
  }
  // The current generation is the new generation
  cells = nextgen;
  param.generation++;
}


// Implementing the Wolfram rules
// Could be improved and made more concise, but here we can explicitly see what is going on for each case
function rules(a, b, c) {
  if (a == 1 && b == 1 && c == 1) return ruleset[0];
  if (a == 1 && b == 1 && c == 0) return ruleset[1];
  if (a == 1 && b == 0 && c == 1) return ruleset[2];
  if (a == 1 && b == 0 && c == 0) return ruleset[3];
  if (a == 0 && b == 1 && c == 1) return ruleset[4];
  if (a == 0 && b == 1 && c == 0) return ruleset[5];
  if (a == 0 && b == 0 && c == 1) return ruleset[6];
  if (a == 0 && b == 0 && c == 0) return ruleset[7];
  return 0;
}