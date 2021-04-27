let modelData;
let camera;

function preload(){
    modelData = loadModel('/models/3dtest/car.obj');
}
function setup(){

	createCanvas(windowWidth*0.9,windowHeight*0.9,WEBGL);
    camera = createEasyCam();

}

function draw(){
    clear();
    background(65);
    model(modelData);
}
