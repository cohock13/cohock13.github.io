let modelData;
let camera;

function preload(){
    modelData = loadModel('/models/3dtest/car.obj',true);
}
function setup(){
	camera = createEasyCam();
	createCanvas(windowWidth*0.9,windowHeight*0.9,WEBGL);

}

function draw(){
    clear();
    background(65);
    model(modelData);
}
