
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

let t = 0;

let redParam,blueParam;
let redPad,bluePad;   // Red:0, Blue:1
let joystickThreshold = 0.03; 

let attemptNum = 1;
let records = [];

let maxRecordLength = 1000;

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
    this.radiusPlayer = 100;

    // deltas
    this.deltaForce = 300;

    // kinematic model parameters

    this.modelMass = 1;
    this.modelCollisionAmp = 100;
    this.modelCollisionPower = 1;
    this.modelFrictionMu = 0.2;

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

    let index = ["time[s]","redPositionX","redPositionY","redVelocityX","redVelocityY","bluePositionX","bluePositionY","blueVelocityX","blueVelocityY","redInput","blueInput"]; 
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
  radiusGUI.add(param,"radiusField",0,500,10).name("Field");
  radiusGUI.add(param,"radiusPlayer",0,300,10).name("Player");
  radiusGUI.open();

  let modelGUI = gui.addFolder("Model");
  modelGUI.add(param,"modelMass",0.1,10,0.1).name("Mass");
  modelGUI.add(param,"modelCollisionAmp",0,200,5).name("Col-Amp");
  modelGUI.add(param,"modelCollisionPower",0,5,1).name("Col-Pow");
  modelGUI.add(param,"modelFrictionMu",0,1,0.1).name("Friction");
  modelGUI.open();

  let deltaGUI = gui.addFolder("Delta");
  deltaGUI.add(param,"deltaForce",0,1000,10).name("Force");
  deltaGUI.open();

  let simulationGUI = gui.addFolder("Simulator");
  simulationGUI.add(param,"inputStyle",["Joystick","WASD"]).name("Input");
  simulationGUI.add(param,"exportCSV").name("Export Data");
  simulationGUI.add(param,"reset_").name("Reset");
  simulationGUI.open();
    
  //gui.destroy();

} 

function draw(){

  // data recording


  let pads = navigator.getGamepads();
  redPad = pads[0];
  bluePad = pads[1];

  if(param.isRecording){
    
    let redInputMsg = makeInputMessage(0);
    let blueInputMsg = makeInputMessage(1);

    // record : t, pos_red_x, pos_red_y, pos_blue_x, pos_blue_y, input_red, input_blue
    let record = [t,redParam.position.x,redParam.position.y,redParam.velocity.x,redParam.velocity.y,blueParam.position.x,blueParam.position.y,blueParam.velocity.x,blueParam.velocity.y,redInputMsg,blueInputMsg];
    records.push(record);
    t += dt;
    
  }

  // flag update
  flagUpdate();

  // position update
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
        else{
            resMsg = [bluePad.axes[0],bluePad.axes[1]];
        }
    }

    return resMsg;

}

function flagUpdate(){

    // 1. start recording by pushing space
    if(keyIsDown(keyStartRecording)){
        param.isRecording = true;
    }

    // 2.1. detect win/lose condition

    // red
    if(redParam.position.mag() > param.radiusField){
        param.isGameFinished = true;            
        param.isBlueSideWon = true;
        if(param.isRecording){
            param.isRecording = false;
            records.push(["Blue Won"]);
        }
    }

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

    
    if(param.isCollision){
            // blue -> red      
        let distanceOfPlayers = p5.Vector.sub(redParam.position,blueParam.position).mag();
        let eigenvectorBlueToRed = p5.Vector.sub(redParam.position,blueParam.position).normalize();
        let forceRedCollision = eigenvectorBlueToRed.mult((param.radiusPlayer - distanceOfPlayers)*(param.modelCollisionAmp)); 
        forceRedPlayer.add(forceRedCollision);
    }
    

    redParam.velocity.add(forceRedPlayer.mult(dt/param.modelMass));
    let redVelCopy2 = redParam.velocity.copy();
    redParam.position.add(redVelCopy2.mult(dt));
   
    //blue
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
        else{
            // x
            let resForceX = vectorRight.mult(cutErrorInputs(bluePad.axes[0]));
            // y 
            let redForceY = vectorDown.mult(cutErrorInputs(bluePad.axes[1]));
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
    text("Attempt    : "+attemptNum.toString(),20,30);
    text("Recording : "+param.isRecording.toString(),20,60);
    //text("FPS           :"+frameRate().toString(),20,600);
    
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
    text("Winner      : "+textWinnerMessage,20,90);

    // center line
    translate(canvasWidth/2,canvasHeight/2);

    // field
    fill(20);
    circle(0,0,param.radiusField*2);

    // red
    fill(255,0,0);
    circle(redParam.position.x,redParam.position.y,param.radiusPlayer);

    // blue
    fill(0,0,255);
    circle(blueParam.position.x,blueParam.position.y,param.radiusPlayer);
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

