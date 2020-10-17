function parame(){
    this.x = 0;
    this.y = 0;
    this.z = 0;
}
let param;
function setup() {
    createCanvas(windowWidth,windowHeight,WEBGL);
    createEasyCam();
    let gui = new dat.GUI();
    param = new parame();

    gui.add(param,"x",0,360,1);
    gui.add(param,"y",0,360,1);
    gui.add(param,"z",0,360,1);
  }
  
  function draw() {

    angleMode(DEGREES)
    background(200);
    translate(0,0,0);
    rotateX(param.x);
    rotateY(param.y);
    rotateZ(param.z);
    cone(40, 70);
  }