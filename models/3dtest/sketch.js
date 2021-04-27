let modelData;
let camera;
let img;
function preload(){
    modelData = loadModel('/models/3dtest/car.obj');
}
function setup(){

    img = loadImage("/models/3dtest/color.PNG");
    camera = createEasyCam();
    createCanvas(windowWidth*0.9,windowHeight*0.9,WEBGL);
}

function draw(){
    clear();
    background(150);
    scale(1.5);
    noStroke();
    texture(img);
    model(modelData);
}
