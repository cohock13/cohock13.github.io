function setup() { 
    createCanvas(windowWidth, windowHeight, WEBGL);
    
    // the simplest method to enable the camera
    createEasyCam();
  
    // suppress right-click context menu
    document.oncontextmenu = function() { return false; }
  } 
  
  function draw(){
    background(64);
    //lights();
    box(200);
  }