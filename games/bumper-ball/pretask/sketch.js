
let param,canvas;

let fRate = 60; // framerate, dafault=60;
let dt = 1/fRate;
let canvasWidth = 1200;
let canvasHeight = 650;

// Red:WASD , Blue:Arrow
let keyRedGoRight = 68; //D
let keyRedGoLeft = 65;  //A
let keyRedGoUp = 87;    //W
let keyRedGoDown = 83;  //S
let keyBlueGoRight = 39;//→
let keyBlueGoLeft = 37; //←
let keyBlueGoUp = 38;   //↑
let keyBlueGoDown = 40; //↓

let keyStartRecording = 32;//space
let keyReset = 82;      //R

let redPadNum = 0;
let bluePadNum = 1;

let t = 0;

let redParam,blueParam;
let redPad,bluePad;   // Red:0, Blue:1
let joystickThreshold = 0.03; 

let attemptNum = 1;
let records = [];

let maxRecordLength = 1000;


// tgt pos
let idTarget = 0;
let timeTarget = 0;
let posisitonTarget = [[0,-0.5],[-0.2,0.3],[0.4,0.4],[-0.5,-0.5],[0.7,0.7],[0.8,0.2],[-0.1,0.9],[0.2,-0.8],[-0.2,-0.8],[0,0.5]];

function playerParam(num){

  this.position;
  this.velocity = createVector(0,0);

}


function parameters() {

    // input
    this.inputStyle = "Joystick";

    // flags
    this.isRecording = false;
    this.isGameFinished = false;
    this.isRedSideWon = false;
    this.isBlueSideWon = false;
    this.isCollision = false;
    //this.collisionMode = "SFM";

    // field settings

    this.radiusField = 300;
    this.radiusPlayer = 50;

    // deltas
    this.deltaForce = 300;

    // target 
    this.radiusTarget = 50;
    this.timeTarget = 5;

    // kinematic model parameters

    this.modelMass = 1;
    this.modelCollisionAmp = 100;
    this.modelCollisionPower = 1;
    this.modelFrictionMu = 0.2;

	this.reset_ = function() {
        reset();
	}

    this.switchPadNum = function(){
        [redPadNum,bluePadNum] = [bluePadNum,redPadNum];
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
    timeTarget = param.timeTarget;
    idTarget = 0;

    let attemptDate = new Date();
    // append record index

    records.push(["Date",attemptDate]);
    records.push(["Attempt",attemptNum]);
    records.push(["radiusField",param.radiusField]);
    records.push(["radiusPlayer",param.radiusPlayer]);
    records.push(["modelMass",param.modelMass]);
    records.push(["deltaEvasion",param.modelCollisionAmp]);
    records.push(["deltaCollisionATK",param.modelCollisionPower]);
    records.push(["modelFrictionMu",param.modelFrictionMu]);

    let index = ["time[s]","idTarget","redPositionX","redPositionY","redVelocityX","redVelocityY","redInput"]; 
    records.push(index);
    // reset position
    redParam.position = createVector(0,param.radiusField/2);
    blueParam.position = createVector(0,-param.radiusField/2);
    redParam.velocity = createVector(0,0);
    blueParam.velocity = createVector(0,0);

}

// thanks to https://github.com/processing/p5.js/wiki/Positioning-your-canvas

function centerCanvas() {
    let x = (windowWidth-width)/2;
    let y = (windowHeight-height)/2;
    canvas.position(x,y);
  }

function reset(){

    t = 0;
    attemptNum += 1;
    init();

}

function setup() {

  canvas = createCanvas(canvasWidth,canvasHeight);
  background(20);
  setAttributes("antialias",true);
  centerCanvas();

  frameRate(fRate);
  
  // gui settings 
  param = new parameters();
  redParam = new playerParam();
  blueParam = new playerParam();
  init();

  let gui = new dat.GUI();

  let radiusGUI = gui.addFolder("Radius");
  radiusGUI.add(param,"radiusField",0,1000,10).name("Field");
  radiusGUI.add(param,"radiusPlayer",0,300,10).name("Player");
  radiusGUI.add(param,"radiusTarget",0,300,10).name("Target");
  radiusGUI.open();

  let modelGUI = gui.addFolder("Model");
  modelGUI.add(param,"modelMass",0.1,10,0.1).name("Mass");
  modelGUI.add(param,"modelCollisionAmp",0,200,5).name("Col-Amp");
  modelGUI.add(param,"modelFrictionMu",0,1,0.1).name("Friction");
  modelGUI.open();

  let deltaGUI = gui.addFolder("Delta");
  deltaGUI.add(param,"deltaForce",0,1000,10).name("Force");
  deltaGUI.open();

  let simulationGUI = gui.addFolder("Simulator");
  simulationGUI.add(param,"inputStyle",["Joystick","WASD"]).name("Input");
  simulationGUI.add(param,"exportCSV").name("Export Data");
  simulationGUI.add(param,"reset_").name("Reset");
  simulationGUI.add(param,"switchPadNum").name("Switch Pad");
  simulationGUI.open();

  let targetGUI = gui.addFolder("Target");
  targetGUI.add(param,"timeTarget",0,10,0.5).name("Time");
  targetGUI.open();
    
  //gui.destroy();

} 

function draw(){

  // data recording

  let pads = navigator.getGamepads();
  redPad = pads[redPadNum];

  if(param.isRecording){
    
    let redInputMsg = makeInputMessage(0);

    // record : t, pos_red_x, pos_red_y, pos_blue_x, pos_blue_y, input_red, input_blue
    let record = [t,idTarget,redParam.position.x,redParam.position.y,redParam.velocity.x,redParam.velocity.y,redInputMsg];
    records.push(record);
    t += dt;
    
  }

  // flag update
  flagUpdate();
  
  positionUpdate();

  // draw lines
  drawObjects();

}

function makeInputMessage(num){
    // red:0, blue:1
    let resMsg = "";
    
    if(param.inputStyle == "WASD"){

        if(num == 0){
            if(keyIsDown(keyRedGoUp)){
                resMsg += "↑";
            }
            if(keyIsDown(keyRedGoRight)){
                resMsg += "→";
            }
            if(keyIsDown(keyRedGoDown)){
                resMsg += "↓";
            }
            if(keyIsDown(keyRedGoLeft)){
                resMsg += "←";
            }
        }
        else{
            if(keyIsDown(keyBlueGoUp)){
                resMsg += "↑";
            }
            if(keyIsDown(keyBlueGoRight)){
                resMsg += "→";
            }
            if(keyIsDown(keyBlueGoDown)){
                resMsg += "↓";
            }
            if(keyIsDown(keyBlueGoLeft)){
                resMsg += "←";
            }
        }
    }
    else if(param.inputStyle == "Joystick"){
        if(num == 0){
            resMsg = [redPad.axes[0],redPad.axes[1]];
        }
    }

    return resMsg;

}

function flagUpdate(){

    // 1. start recording by pushing space
    if(keyIsDown(keyStartRecording)){
        param.isRecording = true;
    }

    // 2.1. stage out
    if(redParam.position.mag() > param.radiusField){
        param.isGameFinished = true;            
        if(param.isRecording){
            param.isRecording = false;
            records.push(["Stage Out at "+idTarget.toString()]);
        }
    }

    // 2.2. time out
    if(t > timeTarget){
        param.isGameFinished = true;
        if(param.isRecording){
            param.isRecording = false;
            records.push(["Time Out at "+idTarget.toString()]);
        }
    }

    // 2.3. next target
    let vectorTarget = createVector(param.radiusField*posisitonTarget[idTarget][0],param.radiusField*posisitonTarget[idTarget][1]);
    let distTargetBetPlayer = p5.Vector.sub(redParam.position,vectorTarget).mag();
    //console.log(distTargetBetPlayer,param.radiusPlayer+param.radiusField);

    if(distTargetBetPlayer < param.radiusPlayer + param.radiusTarget){
        
        if(idTarget+1 > posisitonTarget.length){
            param.isGameFinished = true;
            idTarget = 0;
                if(param.isRecording){
                    param.isRecording = false;
                    records.push(["Stage clear at t = "+t.toString()]);
                }      
        }
        else{
            idTarget += 1;
            timeTarget = t + param.timeTarget;
        }
    }

    /*
    // blue
    if(blueParam.position.mag() > param.radiusField){
        param.isGameFinished = true;
        param.isRedSideWon = true;
        if(param.isRecording){
            param.isRecording = false;
            records.push(["Red Won"]);
        }
    }

    // 3. detect collision

    let distanceOfPlayers = p5.Vector.sub(redParam.position,blueParam.position).mag();

    if(distanceOfPlayers < param.radiusPlayer){
        param.isCollision = true;
    }
    else{
        param.isCollision = false;
    }
    */


}

function positionUpdate(){

    if(param.isGameFinished){
        return;
    }

    let forceRedPlayer = createVector(0,0);
    let forceBluePlayer = createVector(0,0);

    //red

    let forceInputRedPlayer = calcInputForce(0);
    forceRedPlayer.add(forceInputRedPlayer);
    let redVelCopy1 = redParam.velocity.copy();
    let forceRedFriction = redVelCopy1.mult(-param.modelFrictionMu);
    forceRedPlayer.add(forceRedFriction);

    redParam.velocity.add(forceRedPlayer.mult(dt/param.modelMass));
    let redVelCopy2 = redParam.velocity.copy();
    redParam.position.add(redVelCopy2.mult(dt));
   
    //blue

    /*
    let forceInputBluePlayer = calcInputForce(1);
    forceBluePlayer.add(forceInputBluePlayer);
    let blueVelCopy1 = blueParam.velocity.copy();
    let forceBlueFriction = blueVelCopy1.mult(-param.modelFrictionMu);
    forceBluePlayer.add(forceBlueFriction);

    if(param.isCollision){
            // red -> blue     
            let distanceOfPlayers = p5.Vector.sub(blueParam.position,redParam.position).mag();
            let eigenvectorRedToBlue = p5.Vector.sub(blueParam.position,redParam.position).normalize();
            let forceBlueCollision = eigenvectorRedToBlue.mult((param.radiusPlayer - distanceOfPlayers)*(param.modelCollisionAmp)); 
            forceBluePlayer.add(forceBlueCollision);
    }

    blueParam.velocity.add(forceBluePlayer.mult(dt));
    let blueVelCopy2 = blueParam.velocity.copy();
    blueParam.position.add(blueVelCopy2.mult(dt));
    */

}

function calcInputForce(num){

    let resForce = createVector(0,0);

    let vectorUp = createVector(0,-1);
    vectorUp.mult(param.deltaForce);
    let vectorRight = createVector(1,0);
    vectorRight.mult(param.deltaForce);
    let vectorDown = createVector(0,1);
    vectorDown.mult(param.deltaForce);
    let vectorLeft = createVector(-1,0);
    vectorLeft.mult(param.deltaForce);

    if(param.isRecording == false){
        return resForce;
    }

    if(param.inputStyle == "Joystick"){

        if(num == 0){
            // x
            let resForceX = vectorRight.mult(cutErrorInputs(redPad.axes[0]));
            // y 
            let redForceY = vectorDown.mult(cutErrorInputs(redPad.axes[1]));
            resForce.add(resForceX);
            resForce.add(redForceY);
        }

    }
    else if(param.inputStyle == "WASD"){
        if(num==0){
            if(keyIsDown(keyRedGoUp)){
                resForce.add(vectorUp);
            }
            if(keyIsDown(keyRedGoRight)){
                resForce.add(vectorRight);
            }
            if(keyIsDown(keyRedGoDown)){
                resForce.add(vectorDown);
            }
            if(keyIsDown(keyRedGoLeft)){
                resForce.add(vectorLeft);
            }
        }
        else{
            if(keyIsDown(keyBlueGoUp)){
                resForce.add(vectorUp);
            }
            if(keyIsDown(keyBlueGoRight)){
                resForce.add(vectorRight);
            }
            if(keyIsDown(keyBlueGoDown)){
                resForce.add(vectorDown);
            }
            if(keyIsDown(keyBlueGoLeft)){
                resForce.add(vectorLeft);
            }
        }
    }

    return resForce;
}

function cutErrorInputs(num){
    if(abs(num) < joystickThreshold){
        return 0;
    }
    return num;
}

function drawObjects(){

    clear();
    background(220);
    ///// recording or not
    noStroke();
    textSize(24);
    fill(30);
    text("Attempt   : "+attemptNum.toString(),20,30);
    text("Recording : "+param.isRecording.toString(),20,60);
    let timeText = t;
    text("Time        : "+timeText.toString().slice(0,4),20,90);
    //text("FPS           :"+frameRate().toString(),20,600);


    // center line
    translate(canvasWidth/2,canvasHeight/2);

    // field
    fill(20);
    circle(0,0,param.radiusField*2);

    // red
    fill(255,0,0);
    circle(redParam.position.x,redParam.position.y,param.radiusPlayer*2);

    // target : circle
    if(param.isGameFinished == false){
        fill(0,0,255);
        circle(param.radiusField*posisitonTarget[idTarget][0],param.radiusField*posisitonTarget[idTarget][1],param.radiusTarget*2);
    }


    // target : timer

    // blue
    /*
    fill(0,0,255);
    circle(blueParam.position.x,blueParam.position.y,param.radiusPlayer);
    */
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

