let modelData;
let camera;
let img;
function preload(){
    modelData = loadModel('https://cohock13.github.io/models/3dtest/car.obj',true);
}
function setup(){
    img = loadImage("https://cohock13.github.io/models/3dtest/color.PNG");
    createCanvas(windowWidth*0.9,windowHeight*0.9,WEBGL);
    camera = createEasyCam();

    modelData = loadModel('/models/3dtest/car.obj',true);
}
function setup(){

    img = loadImage("/models/3dtest/color.PNG");
    camera = createEasyCam();
    createCanvas(windowWidth*0.9,windowHeight*0.9,WEBGL);
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
