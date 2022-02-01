
let leftCamera, rightCamera;
let leftParam,rightParam;

let fRate = 60; // frame Rate
let dt = 1/fRate;
let canvasWidthCoef = 0.43;

let t = 0;

let leftCells,rightCells;
let redCellColor = "rgb(255,51,51)";
let greenCellColor = "rgb(51,255,51)";
let xBoundary = 300;
let yBoundary = 300;
let zBoundary = 100;

let records = [];
let vecRecords = [];
let maxRecordLength = 1000;


function parameters() {

    this.score = 10;

    this.cellMode = "Random";

    this.evalDistMode = "Range";
    this.evalTimeMode = "Instant";
    this.evalExpAmp = 2;
    this.evalExpCoef = 0.02;
    this.evalDistRange = 20;
    this.evalTimeRange = 30;

    this.redCellNum = 400;
    this.greenCellNum = 200;
    this.maxRedCellInitVelocity = 30;
    this.maxGreenCellInitVelocity = 10;
    this.redCellRadius = 5;
    this.greenCellRadius = 10;

    this.ka = 0.5;
    this.kb = 1;

    this.isSimLightON = true;

	this.reset = function() {
		leftCells = new cells(leftParam);
        rightCells = new cells(rightParam);
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

function setup() {

  createCanvas(windowWidth, windowHeight);
  setAttributes("antialias",true);

  frameRate(fRate);

  let canvasWidth = Math.ceil(windowWidth*canvasWidthCoef);
  let canvasHeight = windowHeight;
  
  let leftCanvas = createGraphics(canvasWidth, canvasHeight, WEBGL)
  let rightCanvas = createGraphics(canvasWidth, canvasHeight, WEBGL);
  
  console.log(Dw.EasyCam.INFO);

  leftCamera = new Dw.EasyCam(leftCanvas._renderer);
  rightCamera = new Dw.EasyCam(rightCanvas._renderer);
  
  leftCamera.attachMouseListeners(this._renderer);
  rightCamera.attachMouseListeners(this._renderer);
  

  // add some custom attributes
  leftCamera.IDX = 0;
  rightCamera.IDX = 1;
  
  // set viewports
  leftCamera.setViewport([0,0,canvasWidth,canvasHeight]);
  rightCamera.setViewport([canvasWidth,0,canvasWidth,canvasHeight]);

  // gui settings 
  leftParam = new parameters();
  rightParam = new parameters();
  rightParam.cellMode = "Parallel";
  rightParam.maxGreenCellInitVelocity = 10;
  rightParam.maxRedCellInitVelocity = 10;

  let gui = new dat.GUI();

  let scoreGUI = gui.addFolder("Score");
  scoreGUI.add(leftParam,"score",-0.2,1,0.01).name("Left").listen();
  scoreGUI.add(rightParam,"score",-0.2,1,0.01).name("Right").listen();
  scoreGUI.open();

  let cellModeGUI = gui.addFolder("Cell Mode");
  cellModeGUI.add(leftParam,"cellMode",["Parallel","Random"]).name("Left");
  cellModeGUI.add(rightParam,"cellMode",["Parallel","Random"]).name("Right");
  cellModeGUI.open();

  let evalGUI = gui.addFolder("Evaluation");
  let leftEvalGUI = evalGUI.addFolder("Left");
  leftEvalGUI.add(leftParam,"evalDistMode",["Range"]).name("Distance");
  leftEvalGUI.add(leftParam,"evalTimeMode",["Instant"]).name("Velocity");
  leftEvalGUI.open();
  let rightEvalGUI = evalGUI.addFolder("Right");
  rightEvalGUI.add(rightParam,"evalDistMode",["Range"]).name("Distance");
  rightEvalGUI.add(rightParam,"evalTimeMode",["Instant"]).name("Velocity");
  rightEvalGUI.open();
  let evalParameterGUI = evalGUI.addFolder("Parameter");
  let leftEvalParameterGUI = evalParameterGUI.addFolder("Left");
  leftEvalParameterGUI.add(leftParam,"evalExpCoef",0,0.2,0.01).name("Exp Coef");
  leftEvalParameterGUI.add(leftParam,"evalDistRange",0,30,1).name("Dist Range");
  leftEvalParameterGUI.add(leftParam,"evalTimeRange",0,100,1).name("Time Range");
  leftEvalParameterGUI.open();
  let rightEvalParameterGUI = evalParameterGUI.addFolder("Right");
  rightEvalParameterGUI.add(rightParam,"evalExpCoef",0,0.2,0.01).name("Exp Coef");
  rightEvalParameterGUI.add(rightParam,"evalDistRange",0,30,1).name("Dist Range");
  rightEvalParameterGUI.add(rightParam,"evalTimeRange",0,100,1).name("Time Range");
  rightEvalParameterGUI.open();
  evalGUI.open();

  let cellParameterGUI = gui.addFolder("Cell Parameter");
  
  let leftCellParameterGUI = cellParameterGUI.addFolder("Left");
  let leftCellNumParameterGUI = leftCellParameterGUI.addFolder("N of Cells")
  leftCellNumParameterGUI.add(leftParam,"redCellNum",1,500,1).name("Red");
  leftCellNumParameterGUI.add(leftParam,"greenCellNum",1,300,1).name("Green");
  leftCellNumParameterGUI.open();
  /*
  let leftCellRadiusParameterGUI = leftCellParameterGUI.addFolder("Cell Radius");
  leftCellRadiusParameterGUI.add(leftParam,"redCellRadius",1,10,1).name("Red");
  leftCellRadiusParameterGUI.add(leftParam,"greenCellRadius",3,15,1).name("Green");
  leftCellRadiusParameterGUI.open();
  */
  let leftCellInitVelocityParameterGUI = leftCellParameterGUI.addFolder("Max Init Velocity");
  leftCellInitVelocityParameterGUI.add(leftParam,"maxRedCellInitVelocity",0,100,0.1).name("Red");
  leftCellInitVelocityParameterGUI.add(leftParam,"maxGreenCellInitVelocity",0,30,0.1).name("Green"); 
  //leftCellInitVelocityParameterGUI.open();
  leftCellParameterGUI.open();

  let rightCellParameterGUI = cellParameterGUI.addFolder("Right");
  let rightCellNumParameterGUI = rightCellParameterGUI.addFolder("N of Cells")
  rightCellNumParameterGUI.add(rightParam,"redCellNum",1,500,1).name("Red");
  rightCellNumParameterGUI.add(rightParam,"greenCellNum",1,300,1).name("Green");
  rightCellNumParameterGUI.open();
  /*
  let rightCellRadiusParameterGUI = rightCellParameterGUI.addFolder("Cell Radius");
  rightCellRadiusParameterGUI.add(rightParam,"redCellRadius",1,10,1).name("Red");
  rightCellRadiusParameterGUI.add(leftParam,"greenCellRadius",3,15,1).name("Green");
  rightCellRadiusParameterGUI.open();
  */
  let rightCellInitVelocityParameterGUI = rightCellParameterGUI.addFolder("Max Init Velocity");
  rightCellInitVelocityParameterGUI.add(leftParam,"maxRedCellInitVelocity",0,100,0.1).name("Red");
  rightCellInitVelocityParameterGUI.add(rightParam,"maxGreenCellInitVelocity",0,30,0.1).name("Green"); 
  //rightCellInitVelocityParameterGUI.open();
  rightCellParameterGUI.open();

  /*
  let modelParameterGUI = gui.addFolder("Simple Model");
  let leftModelParameterGUI = modelParameterGUI.addFolder("Left");
  leftModelParameterGUI.add(leftParam,"ka",0,5,0.1);
  leftModelParameterGUI.add(leftParam,"kb",0,5,0.1);
  leftModelParameterGUI.open();
  let rightModelParameterGUI =  modelParameterGUI.addFolder("Right");
  rightModelParameterGUI.add(rightParam,"ka",0,5,0.1);
  rightModelParameterGUI.add(rightParam,"kb",0,5,0.1);
  rightModelParameterGUI.open();
  modelParameterGUI.open();
  */

  let simulationGUI = gui.addFolder("Simulator");
  simulationGUI.add(leftParam,"isSimLightON").name("Light(left)");
  simulationGUI.add(rightParam,"isSimLightON").name("Light(right)");
  simulationGUI.add(rightParam,"exportCSV").name("Export Score");
  simulationGUI.add(leftParam,"reset").name("Reset");
  simulationGUI.open();

  //gui.destroy();

  leftCells = new cells(leftParam);
  rightCells = new cells(rightParam);

} 

function draw(){

  t += dt;

  // calc scores
  updateScores(leftParam,leftCells,"Right");
  updateScores(rightParam,leftCells,"Left");

  saveScores(leftParam,rightParam);

  leftCells.updatePosition();
  //leftCells.updateVelocity(leftParam);
  leftCells.drawCells(leftCamera,leftParam);

  rightCells.updatePosition();
  //rightCells.updateVelocity(rightParam);
  rightCells.drawCells(rightCamera,rightParam);
  
  displayCanvas();

}

function displayCanvas(){

  let vpLeftCamera = leftCamera.getViewport();
  let vpRightCamera = rightCamera.getViewport();
  
  image(leftCamera.graphics, vpLeftCamera[0], vpLeftCamera[1], vpLeftCamera[2], vpLeftCamera[3]);
  image(rightCamera.graphics, vpRightCamera[0], vpRightCamera[1], vpRightCamera[2], vpRightCamera[3]);

}

function windowResized() {

    resizeCanvas(windowWidth, windowHeight);
    
    let canvasWidth = Math.ceil(windowWidth*canvasWidthCoef);
    let canvasHeight = windowHeight;
    
    // resize p5.RendererGL
    leftCamera.renderer.resize(canvasWidth,canvasHeight);
    rightCamera.renderer.resize(canvasWidth,canvasHeight);
    
    // set new graphics dim
    leftCamera.graphics.width  = canvasWidth;
    leftCamera.graphics.height = canvasHeight;
    
    rightCamera.graphics.width  = canvasWidth;
    rightCamera.graphics.height = canvasHeight;
  
    // set new viewport
    leftCamera.setViewport([0,0,canvasWidth,canvasHeight]);
    rightCamera.setViewport([canvasWidth,0,canvasWidth,canvasHeight]);

  }


class cells {
    
    constructor(param) {

        this.redCellPosition = [];
        this.redCellVelocity = [];
        this.greenCellPosition = [];
        this.greenCellVelocity = [];

        randomSeed(100);

        if(param.cellMode == "Random"){

            for(let i=0;i<param.redCellNum;++i){
                let xPos = random(-xBoundary,xBoundary);
                let yPos = random(-yBoundary,yBoundary);
                let zPos = random(-zBoundary,zBoundary);
                let tmpPos = createVector(xPos,yPos,zPos);
                this.redCellPosition.push(tmpPos);

                let xVel = random(-param.maxRedCellInitVelocity,param.maxRedCellInitVelocity);
                let yVel = random(-param.maxRedCellInitVelocity,param.maxRedCellInitVelocity);
                let zVel = random(-param.maxRedCellInitVelocity,param.maxRedCellInitVelocity);
                let tmpVel = createVector(xVel,yVel,zVel);
                this.redCellVelocity.push(tmpVel);
            }

            for(let i=0;i<param.greenCellNum;++i){
                let xPos = random(-xBoundary,xBoundary);
                let yPos = random(-yBoundary,yBoundary);
                let zPos = random(-zBoundary,zBoundary);

                let tmpVec = createVector(xPos,yPos,zPos);
                this.greenCellPosition.push(tmpVec);

                let xVel = random(-param.maxGreenCellInitVelocity,param.maxGreenCellInitVelocity);
                let yVel = random(-param.maxGreenCellInitVelocity,param.maxGreenCellInitVelocity);
                let zVel = random(-param.maxGreenCellInitVelocity,param.maxGreenCellInitVelocity);
                let tmpVel = createVector(xVel,yVel,zVel);
                this.greenCellVelocity.push(tmpVel);
            }
        }
        else{
            for(let i=0;i<param.greenCellNum;++i){
                let xPos = random(-xBoundary,xBoundary);
                let yPos = random(-yBoundary,yBoundary);
                let zPos = random(-zBoundary,zBoundary);

                let tmpVec = createVector(xPos,yPos,zPos);
                this.greenCellPosition.push(tmpVec);

                let xVel = random(-param.maxGreenCellInitVelocity,param.maxGreenCellInitVelocity);
                let yVel = random(-param.maxGreenCellInitVelocity,param.maxGreenCellInitVelocity);
                let zVel = random(-param.maxGreenCellInitVelocity,param.maxGreenCellInitVelocity);
                let tmpVel = createVector(xVel,yVel,zVel);
                this.greenCellVelocity.push(tmpVel);
            }

            let tmpLength = this.greenCellPosition.length;

            for(let i=0;i<param.redCellNum;++i){

                let num = i%tmpLength; 
                let tmpPos = this.greenCellPosition[num].copy();
                let tmpAddVel = p5.Vector.random3D();
                tmpAddVel.mult(param.redCellRadius+param.greenCellRadius);
                tmpPos.add(tmpAddVel);
                this.redCellPosition.push(tmpPos);

                let tmpVel = this.greenCellVelocity[num].copy();
                this.redCellVelocity.push(tmpVel);
            }

            
        }

    }

    updatePosition(){

        for(let i=0;i<this.redCellVelocity.length;++i){
            let delta = this.redCellVelocity[i].copy();
            delta.mult(dt);
            this.redCellPosition[i].add(delta);
        }
        
        for(let i=0;i<this.greenCellVelocity.length;++i){
            let delta = this.greenCellVelocity[i].copy();
            delta.mult(dt);
            this.greenCellPosition[i].add(delta);
        }

        // boundary adjustment

        for(let i=0;i<this.redCellVelocity.length;++i){
            let tmpPos = this.redCellPosition[i].copy();
            this.redCellPosition[i] = positionAdjustment(tmpPos);
        }

        for(let i=0;i<this.greenCellVelocity.length;++i){
            let tmpPos = this.greenCellPosition[i].copy();
            this.greenCellPosition[i] = positionAdjustment(tmpPos);
        }

    }

    updateVelocity(param){

        if(param.cellMode == "Parallel"){

            for(let i=0;i<this.redCellPosition.length;++i){ // i : red cell

                let x1 = this.redCellPosition[i].x;
                let y1 = this.redCellPosition[i].x;
                let z1 = this.redCellPosition[i].y;

                for(let j=0;j<this.greenCellPosition.length;++j){ // j : green cell
                    
                    // calc radius
                    let x2 = this.greenCellPosition[j].x;
                    let y2 = this.greenCellPosition[j].y;
                    let z2 = this.greenCellPosition[j].z;

                    let cellDist = dist(x1,y1,z1,x2,y2,z2);

                    // calc force

                    let force = (param.ka/cellDist - param.kb/(cellDist*cellDist));

                    // calc eigenvector

                    let vectorRed2Green = createVector(x2-x1,y2-y1,z2-z1);
                    vectorRed2Green.normalize();
                    vectorRed2Green.mult(force*dt);
                    let vectorGreen2Red = vectorRed2Green.copy();
                    vectorGreen2Red.rotate(PI);
                    
                    this.redCellVelocity[i].add(vectorRed2Green);
                    //this.greenCellVelocity[j].add(vectorGreen2Red);

                }
            }
        }


    }

    drawCells(cam,param){

        let p = cam.graphics;
        let canvasWidth = p.width;
        let canvasHeight = p.height;  

        p.push();
        p.noStroke();

        p.clear();
        if(cam.IDX == 0){
            p.background(220);
        }
        if(cam.IDX == 1){
            p.background(32);
        }
        
        if(param.isSimLightON){
            p.ambientLight(100);
            p.pointLight(255,250,244,0,0,500); // sunlight
        }
        

        p.perspective(100 * PI/180, canvasWidth/canvasHeight, 1,5000);

        for(let i=0;i<this.redCellPosition.length;++i){
            p.push();
            let xPos = this.redCellPosition[i].x;
            let yPos = this.redCellPosition[i].y;
            let zPos = this.redCellPosition[i].z;
            p.translate(xPos,yPos,zPos);
            p.fill(redCellColor);
            p.sphere(param.redCellRadius);
            p.pop();
        }

        for(let i=0;i<this.greenCellPosition.length;++i){
            p.push();
            let xPos = this.greenCellPosition[i].x;
            let yPos = this.greenCellPosition[i].y;
            let zPos = this.greenCellPosition[i].z;
            p.translate(xPos,yPos,zPos);
            p.fill(greenCellColor);
            p.sphere(param.greenCellRadius);
            p.pop();
        }


        // xyz axis
        let axisRadius = 2;
        //x
        p.push();
        p.fill(223,32,32);
        p.rotateZ(PI/2);
        p.cylinder(axisRadius,2*xBoundary);
        p.pop();

        //y
        p.push();
        p.fill(32,223,32);
        p.cylinder(axisRadius,2*yBoundary);
        p.pop();

        //z
        p.push();
        p.fill(32,32,223);
        p.rotateX(PI/2);
        p.cylinder(axisRadius,2*zBoundary);
        p.pop();


        p.pop();

    }

}

function positionAdjustment(vec){

    let x = vec.x;
    let y = vec.y;
    let z = vec.z;

    if(x > xBoundary){
        x = -xBoundary+(x-xBoundary);
    }
    else if(x < -xBoundary){
        x = xBoundary+(x+xBoundary);
    }

    if(y > yBoundary){
        y = -yBoundary+(y-yBoundary);
    }
    else if(y < -yBoundary){
        y = yBoundary+(y+yBoundary);
    }

    if(z > zBoundary){
        z = -zBoundary+(z-zBoundary);
    }
    else if(z < -zBoundary){
        z = zBoundary+(z+zBoundary);
    }

    let retVec = createVector(x,y,z);

    return retVec;

}

function updateScores(param,cells,side){

    let tmpScore = 0;

    //console.log(cells.redCellPosition,cells.greenCellPosition,param.cellMode);

    if(param.evalDistMode == "Range"){
        if(param.evalTimeMode == "Average"){
            
        }
        else if(param.evalTimeMode == "Instant"){

            for(let i=0;i<cells.greenCellPosition.length;++i){
                for(let j=0;j<cells.redCellPosition.length;++j){

                    if(side == "Right"){
                        if(cellDist(rightCells,i,j) < param.evalDistRange){
                            let angle = rightCells.greenCellVelocity[i].angleBetween(rightCells.redCellVelocity[j]);
                            //console.log(t,cos(angle),i,j,param.cellMode)
                            tmpScore += cos(angle);
                        }
                    }
                    else{
                        if(cellDist(leftCells,i,j) < param.evalDistRange){
                            let angle = leftCells.greenCellVelocity[i].angleBetween(leftCells.redCellVelocity[j]);
                            //console.log(t,cos(angle),i,j,param.cellMode)
                            tmpScore += cos(angle);
                        }
                    }
                }
            }
        }

    }
    else{ // exp

    }
    
    param.score = tmpScore/cells.redCellPosition.length;

}

function saveScores(leftParam,rightParam){

    let tmpRecord = [t,leftParam.score,rightParam.score,leftParam.evalDistMode,leftParam.evalTimeMode,rightParam.evalDistMode,rightParam.evalTimeMode]
    records.push(tmpRecord);

    //vecRecords.push(leftCells.redCellVelocity);

    if(records.length > maxRecordLength){
        records.shift();
    }

}

function cellDist(cells,i,j){

    let d = cells.greenCellPosition[i].dist(cells.redCellPosition[j]);

    return d;
}

function test(cam){
    let pg = cam.graphics;
  
    let canvasWidth = pg.width;
    let canvasHeight = pg.height;
    
    pg.push();
    //pg.noStroke();
    if(cam.IDX == 0) {pg.clear(220);pg.background(220);}
    if(cam.IDX == 1) {pg.clear(32);pg.background(32);}
    // projection
    pg.perspective(60 * PI/180, canvasWidth/canvasHeight, 1, 5000);
  
    pg.ambientLight(100);
    pg.pointLight(255, 250, 244, 0, 0, 0); // sunlight
    pg.push();
   
  
    pg.sphere(50);
    pg.pop();
  
    pg.pop();

}

function displayScene(cam){

    let pg = cam.graphics;
    
    let canvasWidth = pg.width;
    let canvasHeight = pg.height;
    
    let gray = 200;
    
    pg.push();
    //pg.noStroke();
    
    // projection
    pg.perspective(60 * PI/180, canvasWidth/canvasHeight, 1, 5000);
  
    // BG
    if(cam.IDX == 0) {pg.clear(220);pg.background(220);}
    if(cam.IDX == 1) {pg.clear(32);pg.background(32);}
   
    pg.ambientLight(100);
    pg.pointLight(255, 250, 244, 0, 0, 0); // sunlight
    
    // objects
    randomSeed(2);
  
    pg.push();
    pg.sphere(50);
    pg.pop();
    /*
    for(let i = 0; i < 50; i++){
      pg.push();
      let m = 100;
      let tx = random(-m, m);
      let ty = random(-m, m);
      let tz = random(-m, m);
  
      let r = ((tx / m) * 0.5 + 0.5) * 255;
      let g = ((ty / m) * 0.5 + 0.5) * r/2;
      let b = ((tz / m) * 0.5 + 0.5) * g;
   
      pg.translate(tx, ty, tz);
      
      let gray = random(64,255);
  
      if(cam.IDX == 0) pg.ambientMaterial(r,g,b);
      if(cam.IDX == 1) pg.ambientMaterial(gray);
      
      pg.box(random(10,40));
      pg.pop();
    }
    */
  
    /*
    
    pg.emissiveMaterial(255, 250, 244);
    pg.box(50, 50, 10);
    
    pg.push();
    pg.rotateZ(sin(frameCount*0.007) * PI*1.5);
    pg.translate(130, 0, 0);
    pg.ambientMaterial(0,128,255);
    pg.sphere(15);
    pg.pop();
      
    pg.push();
    pg.rotateX(sin(frameCount*0.01) * PI);
    pg.translate(0, 160, 0);
    pg.ambientMaterial(128,255,0);
    pg.sphere(15);
    pg.pop();
    */
    
    pg.pop();
  }