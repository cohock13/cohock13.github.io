let modelData;
let camera;

function preload(){
    modelData = loadModel('car.obj');
}
function setup(){

	createCanvas(windowWidth*0.9,windowHeight*0.9,WEBGL);
    camera = createEasyCam({distance:windowWidth});

}

function draw(){
    model(modelData);
}