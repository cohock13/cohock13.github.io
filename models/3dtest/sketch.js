let modelData;
let camera;
let img;
function preload(){
<<<<<<< HEAD
    modelData = loadModel('http://cohock13.github.io/models/3dtest/car.obj',true);
}
function setup(){
    img = loadImage("http://cohock13.github.io/models/3dtest/color.PNG");
	createCanvas(windowWidth*0.9,windowHeight*0.9,WEBGL);
    camera = createEasyCam();

=======
    modelData = loadModel('/models/3dtest/car.obj',true);
}
function setup(){

    img = loadImage("/models/3dtest/color.PNG");
    camera = createEasyCam();
    createCanvas(windowWidth*0.9,windowHeight*0.9,WEBGL);
>>>>>>> cfbf19e12710279eb9ba237fb1347d262c1c493e
}

function draw(){
    clear();
    background(150);
    scale(3);
    //texture(img);
    fill(210,0,0);
    stroke(180,0,0);
    model(modelData);
}
