let modelData;
let camera;
let img;
function preload(){
<<<<<<< HEAD
    modelData = loadModel('http://cohock13.github.io/models/3dtest/car.obj',true);
=======
    modelData = loadModel('https://cohock13.github.io/models/3dtest/car.obj',true);
>>>>>>> 6544c86b61e365e3e3c5540765a1ce156c7b331b
}
function setup(){
    img = loadImage("https://cohock13.github.io/models/3dtest/color.PNG");
    createCanvas(windowWidth*0.9,windowHeight*0.9,WEBGL);
    camera = createEasyCam();

<<<<<<< HEAD
=======
    modelData = loadModel('/models/3dtest/car.obj',true);
}
function setup(){

    img = loadImage("/models/3dtest/color.PNG");
    camera = createEasyCam();
    createCanvas(windowWidth*0.9,windowHeight*0.9,WEBGL);
>>>>>>> 6544c86b61e365e3e3c5540765a1ce156c7b331b
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
