
let param,canvas;

let fRate = 60; // frame Rate
let dt = 1/fRate;
let canvasWidth = 1500;
let canvasHeight = 500;

let keyRedAttack = 87;     // W
let keyRedEvasion = 81;    // Q
let keyBlueAttack = 79;    // O
let keyBlueEvasion = 80;   // P
let keyStartRecording = 32;// space
let keyReset = 82;         // R

let t = 0;
let timeEndCollision= -1;

let redParam,blueParam;

let attemptNum = 1;
let records = [];

let maxRecordLength = 1000;

function playerParam(){
    this.length = 10;
}


function parameters() {

    // flags
    this.isRecording = false;
    this.isGameFinished = false;
    this.isRedSideWon = false;
    this.isBlueSideWon = false;
    this.isCollision = false;
    this.isCollisionRed2Blue = false;
    this.isCollisionBlue2Red = false;

    // game settings
    this.limitForward = 350;
    this.limitBackward = 200;

    this.startPosition = 50;

    this.deltaAttack = 10;
    this.deltaEvasion = 10;
    this.deltaCollisionATK = 10;
    this.deltaCollisionRCV = 25;
    this.deltaResilience = 0.5;

    this.timeCollision = 0.1;


	this.reset_ = function() {
        reset();
	}


    this.exportCSV = function(){

        // output 
        let data = records.map((record)=>record.join(',')).join('\r\n');
        let bom  = new Uint8Array([0xEF, 0xBB, 0xBF]);
        let blob = new Blob([bom, data], {type: 'text/csv'});
        let url = (window.URL || window.webkitURL).createObjectURL(blob);
        let link = document.createElement('a');
        link.download = 'result.csv';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

}

function init(){

    // reset flags
    param.isRecording = false;
    param.isGameFinished = false;
    param.isRedSideWon = false;
    param.isBlueSideWon = false;
    param.isCollision = false;
    param.isCollisionRed2Blue = false;
    param.isCollisionBlue2Red = false;

    // append record index

    records.push(["Attempt",attemptNum]);
    records.push(["limitForward",param.limitForward]);
    records.push(["limitBackward",param.limitBackward]);
    records.push(["deltaAttack",param.deltaAttack]);
    records.push(["deltaEvasion",param.deltaEvasion]);
    records.push(["deltaCollisionATK",param.deltaCollisionATK]);
    records.push(["deltaCollisionRCV",param.deltaCollisionRCV]);
    records.push(["deltaResilience",param.deltaResilience]);
    records.push(["timeCollision",param.timeCollision]);
    let index = ["time[s]","redPosition","bluePosition","isRedAtk","isRedEva","isBlueAtk","isBlueEva"]; 
    records.push(index);
    // reset position
    redParam.length = -param.startPosition;
    blueParam.length = param.startPosition;

}

// thanks to https://github.com/processing/p5.js/wiki/Positioning-your-canvas

function centerCanvas() {
    let x = (windowWidth-width)/2-100;
    let y = (windowHeight-height)/2;
    canvas.position(x,y);
  }

function reset(){

    attemptNum += 1;
    init();

}

function setup() {

  canvas = createCanvas(canvasWidth,canvasHeight);
  background(220);
  setAttributes("antialias",true);
  centerCanvas();

  frameRate(fRate);
  
  // gui settings 
  param = new parameters();
  redParam = new playerParam();
  blueParam = new playerParam();
  init();

  let gui = new dat.GUI();

  let deltaGUI = gui.addFolder("Step");
  deltaGUI.add(param,"deltaAttack",0,50,5).name("Forward");
  deltaGUI.add(param,"deltaEvasion",0,50,5).name("Backward"); 
  deltaGUI.add(param,"deltaCollisionATK",0,100,5).name("Col-Atk");
  deltaGUI.add(param,"deltaCollisionRCV",0,100,5).name("Col-Rcv");
  //deltaGUI.add(param,"deltaResilience",0,3,0.2).name("Resilience");
  deltaGUI.open();

  let lengthGUI = gui.addFolder("Length");
  lengthGUI.add(param,"limitForward",0,1000,10).name("Forward");
  lengthGUI.add(param,"limitBackward",0,1000,10).name("Backward");
  lengthGUI.add(param,"startPosition",0,700,10).name("Start Pos")
  lengthGUI.open();

  let timeGUI = gui.addFolder("Action-Time");
  timeGUI.add(param,"timeCollision",0,0.5,0.05).name("Collision");
  timeGUI.open();

  let simulationGUI = gui.addFolder("Simulator");
  simulationGUI.add(param,"exportCSV").name("Export Data");
  simulationGUI.add(param,"reset_").name("Reset");
  simulationGUI.open();
    
  //gui.destroy();

} 

function draw(){

  t += dt;

  // data recording

  if(param.isRecording){
    // record : t, pos_red, pos_blue, is_atk_red, is_eva_red, is_atk_blue, is_eva_blue, is_red_win
    let isRedAtk = keyIsDown(keyRedAttack);
    let isRedEva = keyIsDown(keyRedEvasion);
    let isBlueAtk = keyIsDown(keyBlueAttack);
    let isBlueEva = keyIsDown(keyBlueEvasion);

    let record = [t,redParam.length,blueParam.length,isRedAtk,isRedEva,isBlueAtk,isBlueEva];
    records.push(record);

  }

  // flag update
  flagUpdate();

  // position update
  positionUpdate();

  // draw lines
  drawObjects();

  //console.log(keyIsDown(keyRedAttack),param.isCollisionRed2Blue,param.isCollisionBlue2Red);

}


function flagUpdate(){

    // 1. start recording by pushing space
    if(keyIsDown(keyStartRecording)){
        param.isRecording = true;
    }

    // 2.1. detect win/lose condition

    let redForwardLimitLineX = -param.startPosition+param.limitForward;
    let redBackwardLimitLineX = -param.startPosition-param.limitBackward;

    // limit line
    let blueForwardLimitLineX = param.startPosition-param.limitForward;
    let blueBackwardLimitLineX = param.startPosition+param.limitBackward;

    // red
    if(redParam.length <= redBackwardLimitLineX || redParam.length >= redForwardLimitLineX){
        param.isGameFinished = true;            
        param.isBlueSideWon = true;
        if(param.isRecording){
            param.isRecording = false;
            records.push(["Blue Won"]);
        }
    }

    // blue
    if(blueParam.length >= blueBackwardLimitLineX || blueParam.length <= blueForwardLimitLineX){
        param.isGameFinished = true;
        param.isRedSideWon = true;
        if(param.isRecording){
            param.isRecording = false;
            records.push(["Red Won"]);
        }
    }

    // 3.1. detect collision
    if(redParam.length >= blueParam.length){
        param.isCollision = true;
        let isRedAtk = keyIsDown(keyRedAttack);
        let isBlueAtk = keyIsDown(keyBlueAttack);

        if(isRedAtk){
            param.isCollisionRed2Blue = true;
        }
        if(isBlueAtk){
            param.isCollisionBlue2Red = true;
        }
        timeEndCollision = t + param.timeCollision;

    }


    // 3.2. end collision 
    if(param.isCollision && t > timeEndCollision){
        param.isCollision = false;
        param.isCollisionBlue2Red = false;
        param.isCollisionRed2Blue = false;
        timeEndCollision = -1;
    }

}

function positionUpdate(){

    if(param.isCollision){
        // collision -> divide into 4 states

        let deltaRedCollision,deltaBlueCollision;
        
        if(param.isCollisionBlue2Red && param.isCollisionRed2Blue){
            deltaRedCollision = param.deltaCollisionRCV;
            deltaBlueCollision = param.deltaCollisionRCV;
        }
        else if(param.isCollisionBlue2Red){
            deltaRedCollision = param.deltaCollisionRCV;
            deltaBlueCollision = param.deltaCollisionATK;
        }
        else if(param.isCollisionRed2Blue){
            deltaRedCollision = param.deltaCollisionATK;
            deltaBlueCollision = param.deltaCollisionRCV;
        }

        redParam.length -= deltaRedCollision;
        blueParam.length += deltaBlueCollision;

    }
    else if(param.isGameFinished === false){

        if(keyIsDown(keyRedAttack)){
            redParam.length += param.deltaAttack;
        }
        if(keyIsDown(keyRedEvasion)){
            redParam.length -= param.deltaEvasion;
        }
    
        // blue
        if(keyIsDown(keyBlueAttack)){
            blueParam.length -= param.deltaAttack;
        }
        if(keyIsDown(keyBlueEvasion)){
            blueParam.length += param.deltaEvasion;
        }
    }

    // resilience
    // yappa nasi


}

function drawObjects(){

    clear();
    background(220);
    ///// recording or not
    noStroke();
    textSize(24);
    fill(30);
    text("Attempt : "+attemptNum.toString(),20,30);
    text("Recording : "+param.isRecording.toString(),20,60);
    let textWinnerMessage = "";
    let textWinnerColor = "rgb(30,30,30)";
    if(param.isBlueSideWon){
        textWinnerMessage = "Blue";
        textWinnerColor = "rgb(0,0,255)";
    }
    else if(param.isRedSideWon){
        textWinnerMessage = "Red";
        textWinnerColor = "rgb(255,0,0)";
    }
    fill(textWinnerColor);
    text("Winner     : "+textWinnerMessage,20,90);

    // center line
    translate(canvasWidth/2,canvasHeight/2);
    let centerLineY = 50;
    stroke(30);
    line(0,centerLineY,0,-centerLineY);

    let ballRadius = 50;

    ///// red 
    // limit line

    let redForwardLimitLineX = -param.startPosition+param.limitForward;
    let redBackwardLimitLineX = -param.startPosition-param.limitBackward;
    let redLimitLineY = 150;
    // limit line
    let blueForwardLimitLineX = param.startPosition-param.limitForward;
    let blueBackwardLimitLineX = param.startPosition+param.limitBackward;
    let blueLimitLineY = redLimitLineY;
    
    // forward limit red
    stroke(255,0,0);
    line(redForwardLimitLineX,redLimitLineY,redForwardLimitLineX,-redLimitLineY);
    // backward limit red
    line(redBackwardLimitLineX,redLimitLineY,redBackwardLimitLineX,-redLimitLineY);
    // forward limit blue
    stroke(0,0,255);
    line(blueForwardLimitLineX,blueLimitLineY,blueForwardLimitLineX,-blueLimitLineY);
    // backward limit blue
    line(blueBackwardLimitLineX,blueLimitLineY,blueBackwardLimitLineX,-blueLimitLineY);

    // bar+ball red
    fill(255,0,0);
    stroke(255,0,0);
    line(-10000,0,redParam.length-ballRadius,0);
    line(redParam.length,-30,redParam.length,30);
    circle(redParam.length-ballRadius/2,0,ballRadius);
    // bar+ball blue
    fill(0,0,255);
    stroke(0,0,255);
    line(10000,0,blueParam.length+ballRadius,0);
    line(blueParam.length,-30,blueParam.length,30);
    circle(blueParam.length+ballRadius/2,0,ballRadius);

}

function windowResized() {

    resizeCanvas(canvasWidth,canvasHeight);
    centerCanvas();
    
}

function keyPressed() {
    if(keyIsDown(keyReset)){
        reset();
    }
  }

