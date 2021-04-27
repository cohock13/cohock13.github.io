let modelData;
let camera;
let img;
function preload(){
    modelData = loadModel('http://cohock13.github.io/models/3dtest/car.obj',true);
}
function setup(){
    img = loadImage("http://cohock13.github.io/models/3dtest/color.PNG");
	createCanvas(windowWidth*0.9,windowHeight*0.9,WEBGL);
    camera = createEasyCam();

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
