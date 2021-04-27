let modelData;
let camera;
let img;
function preload(){
    modelData = loadModel('/models/3dtest/car.obj');
}
function setup(){
<<<<<<< HEAD
    img = loadImage("/models/3dtest/color.PNG");
=======
	camera = createEasyCam();
>>>>>>> b575230898ae23d919c2f88c26c9cdf4ee5d673d
	createCanvas(windowWidth*0.9,windowHeight*0.9,WEBGL);
    camera = createEasyCam();
}

function draw(){
    clear();
    background(150);
    scale(1.5);
    noStroke();
    texture(img);
    model(modelData);
}
