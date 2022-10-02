
let rightCamera, rightCamera;
let rightParam,rightParam;

let fRate = 120; // frame Rate
let dt = 1/fRate;
let canvasWidthCoef = 0.43;

let rightCells,rightCells;
let redCellColor = "rgb(255,51,51)";
let greenCellColor = "rgb(51,255,51)";
let xBoundary = 300;
let yBoundary = 300;
let zBoundary = 100;


function parameters() {

    this.score = 10;

    this.redMode = "Random";
    this.greenMode = "Random";

    this.evalDistMode = "Exp";
    this.evalTimeMode = "Time";
    this.evalExpCoef = 1;
    this.evalDistRange = 10;
    this.evalTimeRange = 1;

    this.redCellNum = 100;
    this.greenCellNum = 200;
    this.maxRedCellInitVelocity = 50;
    this.maxGreenCellInitVelocity = 10;
    this.redCellRadius = 3;
    this.greenCellRadius = 15;

    this.isSimLightON = true;

	this.reset = function() {
		rightCells = new cells(rightParam);
        rightCells = new cells(rightParam);
	}

}

function setup() {

  createCanvas(windowWidth, windowHeight);
  setAttributes("antialias",true);

  frameRate(fRate);

  let canvasWidth = Math.ceil(windowWidth*canvasWidthCoef);
  let canvasHeight = windowHeight;
  
  let rightCanvas = createGraphics(canvasWidth, canvasHeight, WEBGL)
  let rightCanvas = createGraphics(canvasWidth, canvasHeight, WEBGL);
  
  console.log(Dw.EasyCam.INFO);

  rightCamera = new Dw.EasyCam(rightCanvas._renderer);
  rightCamera = new Dw.EasyCam(rightCanvas._renderer);
  
  rightCamera.attachMouseListeners(this._renderer);
  rightCamera.attachMouseListeners(this._renderer);
  

  // add some custom attributes
  rightCamera.IDX = 0;
  rightCamera.IDX = 1;
  
  // set viewports
  rightCamera.setViewport([0,0,canvasWidth,canvasHeight]);
  rightCamera.setViewport([canvasWidth,0,canvasWidth,canvasHeight]);


  // gui settings 
  rightParam = new parameters();
  rightParam = new parameters();
  let gui = new dat.GUI();

  let scoreGUI = gui.addFolder("Score");
  scoreGUI.add(rightParam,"score",0,100,0.1).name("Left");
  scoreGUI.add(rightParam,"score",0,100,0.1).name("rightCellModeGUI");
  scoreGUI.open();

  let cellModeGUI = gui.addFolder("Mode");
  let rightCellModeGUI = cellModeGUI.addFolder("Left");
  rightCellModeGUI.add(rightParam,"redMode",["Simple Force","Random","Position Fixed"]).name("Red");
  rightCellModeGUI.add(rightParam,"greenMode",["Simple Force","Random","Position Fixed"]).name("Green");
  let rightCellModeGUI = cellModeGUI.addFolder("Right");
  rightCellModeGUI.add(rightParam,"redMode",["Simple Force","Random","Position Fixed"]).name("Red");
  rightCellModeGUI.add(rightParam,"greenMode",["Simple Force","Random","Position Fixed"]).name("Green");

  let cellParameterGUI = gui.addFolder("Cell Parameter");
  
  let rightCellParameterGUI = cellParameterGUI.addFolder("Left");
  let rightCellNumParameterGUI = rightCellParameterGUI.add("N of Cells")
  rightCellNumParameterGUI.add(rightParam,"redCellNum",1,300,1).name("Red");
  rightCellNumParameterGUI.add(rightParam,"greenCellNum",1,200,1).name("Green");
  let rightCellRadiusParameterGUI = rightCellParameterGUI.addFolder("Cell Radius");
  rightCellRadiusParameterGUI.add(rightParam,"redCellRadius",1,7,0.1).name("Red");
  rightCellRadiusParameterGUI.add(rightParam,"greenCellRadius",3,15,0.1).name("Green");
  let rightCellInitVelocityParameterGUI = rightCellParameterGUI.addFolder("Max Init Velocity");
  rightCellInitVelocityParameterGUI.add(rightParam,"maxRedCellInitVelocity",0,100,0.1).name("Red");
  rightCellInitVelocityParameterGUI.add(rightParam,"maxGreenCellInitVelocity",0,30,0.1).name("Green"); 

  let rightCellParameterGUI = cellParameterGUI.addFolder("Right");
  let rightCellNumParameterGUI = rightCellParameterGUI.add("N of Cells")
  rightCellNumParameterGUI.add(rightParam,"redCellNum",1,300,1).name("Red");
  rightCellNumParameterGUI.add(rightParam,"greenCellNum",1,200,1).name("Green");
  let rightCellRadiusParameterGUI = rightCellParameterGUI.addFolder("Cell Radius");
  rightCellRadiusParameterGUI.add(rightParam,"redCellRadius",1,7,0.1).name("Red");
  rightCellRadiusParameterGUI.add(rightParam,"greenCellRadius",3,15,0.1).name("Green");
  let rightCellInitVelocityParameterGUI = rightCellParameterGUI.addFolder("Max Init Velocity");
  rightCellInitVelocityParameterGUI.add(leftParam,"maxRedCellInitVelocity",0,100,0.1).name("Red");
  rightCellInitVelocityParameterGUI.add(rightParam,"maxGreenCellInitVelocity",0,30,0.1).name("Green"); 

  let rightCellParameterGUI = cellParameterGUI.addFolder("Right");

  let cellMovementModeGUI = gui.addFolder("Mode");
  cellMovementModeGUI.add(param,"rightMode",["Simple Force","Position Fixed","Random"]).name("Left");
  cellMovementModeGUI.add(param,"rightMode",["Simple Force","Position Fixed","Random"]).name("Right");
  cellMovementModeGUI.open();

  gui.add(param,"reset").name("Reset");

  //gui.destroy();

  rightCells = new cells(rightParam);
  rightCells = new cells(rightParam);

} 

function draw(){
  
  rightCells.updatePosition();
  rightCells.updateVelocity();
  rightCells.updatePosition();
  rightCells.updateVelocity();
  rightCells.drawCells(rightCamera,rightParam);
  rightCells.drawCells(rightCamera,rightParam);

  displayCanvas();

}

function displayCanvas(){

  let vpLeftCamera = rightCamera.getViewport();
  let vpRightCamera = rightCamera.getViewport();
  
  image(rightCamera.graphics, vpLeftCamera[0], vpLeftCamera[1], vpLeftCamera[2], vpLeftCamera[3]);
  image(rightCamera.graphics, vpRightCamera[0], vpRightCamera[1], vpRightCamera[2], vpRightCamera[3]);

}

function windowResized() {

    resizeCanvas(windowWidth, windowHeight);
    
    let canvasWidth = Math.ceil(windowWidth*canvasWidthCoef);
    let canvasHeight = windowHeight;
    
    // resize p5.RendererGL
    rightCamera.renderer.resize(canvasWidth,canvasHeight);
    rightCamera.renderer.resize(canvasWidth,canvasHeight);
    
    // set new graphics dim
    rightCamera.graphics.width  = canvasWidth;
    rightCamera.graphics.height = canvasHeight;
    
    rightCamera.graphics.width  = canvasWidth;
    rightCamera.graphics.height = canvasHeight;
  
    // set new viewport
    rightCamera.setViewport([0,0,canvasWidth,canvasHeight]);
    rightCamera.setViewport([canvasWidth,0,canvasWidth,canvasHeight]);

  }


class cells {
    
    constructor(param) {

        this.redCellPosition = [];
        this.redCellVelocity = [];
        this.greenCellPosition = [];
        this.greenCellVelocity = [];

        randomSeed(100);

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

    updateVelocity(){

        // tikara toka wo kaku yo

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

        for(let i=0;i<param.redCellNum;++i){
            p.push();
            let xPos = this.redCellPosition[i].x;
            let yPos = this.redCellPosition[i].y;
            let zPos = this.redCellPosition[i].z;
            p.translate(xPos,yPos,zPos);
            p.fill(redCellColor);
            p.sphere(param.redCellRadius);
            p.pop();
        }

        for(let i=0;i<param.greenCellNum;++i){
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