var checks=[]


p5.disableFriendlyErrors = true;
var f
var f2
function preload(){
	f=loadFont('font.ttf')
	f2=loadFont('font2.otf')
	rawJSON = loadJSON("https://www.openprocessing.org/api/sketch/923164/true");
}



function setup() {frameRate(30)
	createCanvas(1300, 550,WEBGL);
background(3, 152, 252)
angleMode(DEGREES)
	moveplatsy.push(new Moveplaty(0,260,-7000,100,20,100,100,1))
	moveplatsz.push(new Moveplatz(0,100,-7000,100,20,100,-7200,1))
	moveplatsx.push(new Moveplatx(-250,100,-7500,100,20,100,250,1))
	moveplatsz.push(new Moveplatz(0,100,-7600,100,20,100,-8100,1))
	moveplatsz.push(new Moveplatz(0,60,-8400,100,20,100,-8500,1))
	moveplatsz.push(new Moveplatz(100,20,-8400,100,20,100,-8700,2))
	moveplatsz.push(new Moveplatz(200,-20,-8400,100,20,100,-8900,3))

	
	//xx,yy,zz,ww,hh,dd,yh,ss)
	
	//noStroke()
}
var yy=170
var x=0
var y=0  
var z=-50 
var yspeed=0  
var xspeed=0  
var zspeed=0  
var checkx=0
var checky=0
var checkz=0
var deaths=0
var shade=0
var rmouseX=0
var rmouseY=0
var st=0
var stt=0
var t=0
var fly=1
var r=0
var speed=0
var strr=0  
var j=0
var moveplatsy=[]
var moveplatsx=[]
var moveplatsz=[]
var d=0
function draw() {
	checks=[]
	background(3, 152, 252)
for(j=0;j<2;j++){
		
	t++;cursor(ARROW)
		


	textFont(f)
	textSize(30)
rmouseX=mouseX-width/2
rmouseY=mouseY-height/2
	// ellipse(-width/2,-height/2+35,20,20)
	// ellipse(-width/2+200,-height/2+70,20,20)
	
			push()
	textSize(25)
	 // translate (x/1.5-230,speed+y/1.5-100,z)
noStroke()
text("deaths: "+deaths,-width/2+20,-height/2+30)
//text(x+" "+y+" "+z,0,-height/2+30)
text("FPS: "+round(frameRate()),-width/2+20,-height/2+90)
//text(r,-width/2+200,-height/2+30)
if (shade==1){text("shading: on",-width/2+20,-height/2+60)}else{
text("shading: off",-width/2+20,-height/2+60)}
if (rmouseX>-width/2&&rmouseX<(-width/2)+200&&rmouseY>-height/2+35&&rmouseY<-height/2+70) {cursor(HAND)}
if (rmouseX>-width/2&&rmouseX<(-width/2)+200&&rmouseY>-height/2+35&&rmouseY<-height/2+70&&mouseIsPressed&&shade==1&&st==0) {shade=0;st=1}
 if (rmouseX>-width/2&&rmouseX<(-width/2)+200&&rmouseY>-height/2+35&&rmouseY<-height/2+70&&mouseIsPressed&&shade==0&&st==0) {shade=1;st=1}
 if (rmouseX>-width/2&&rmouseX<(-width/2)+200&&rmouseY>-height/2+35&&rmouseY<-height/2+70&&mouseIsPressed){}else {st=0}
pop()	



	
	

	push()
camera(x-300*sin(r-180),y/1.5-120,z-300*cos(r-180), x,(-speed*1.2+y)-20,z, 0, 1, 0);
 if (shade==1){
	 		pointLight(255,255,255,0,0,z-500)
	 		pointLight(255,255,255,0,0,z+150)
	
	pointLight(255,255,255,-width/2,0,z-200)
	pointLight(255,255,255,width/2,0,z-200)
	pointLight(255,255,255,0,-height/2,z+200)
	pointLight(255,255,255,0,height/2,z+200)
	pointLight(255,255,255,0,0,z+500)
 }
	
 
 // directionalLight(255, 255, 255, -100, 2000,-1000);
	
	//text(z,0,0)
	// text(zspeed+"  "+xspeed,0,0)
	// text(xspeed>0,100,100)
 // pointLight(0,0,0, 0,0, z);
	//ellipse(0,-height/2,20,20)
//ambientMaterial(255,0,255)
		 
/*	
	push()
	translate (0,0,-400)
	fill(0)
box(width,height,1)
pop()		 
	
	push()
	translate (-1350/2,0,400)
	fill(0)
box(width,height,1)
pop()	*/
	
//エージェントをここに置く
	push()
	translate (x,y,z)
	fill("blue")
push()
rotateY(r)
	box(30);
pop()
	y+=yspeed
	x+=xspeed
	z+=zspeed
	if (!keyIsPressed&&abs(speed)<=0.35) {speed=0}
	//if (!keyIsPressed&&abs(zspeed)<=0.35) {zspeed=0}
	
	if (speed>0) {speed-=0.35}
	if (speed<0) {speed+=0.35}	
	


	if (x>500/2-15) {x=500/2-15}
	if (x<-(500/2-15)) {x=-(500/2-15)}
	
	if (z>=-15) {z=-15}
	//if (z<=-380) {z=-380}
	
	if (y>=height/2-35){y=height/2-35}
	if (keyIsDown(32)&&y>=height/2-35){yspeed=-10}
	if (keyIsDown(38)&&abs(speed)<=10){speed+=0.5}
	// if (keyIsDown(37)&&abs(xspeed)<=10){xspeed-=0.5}
	// if (keyIsDown(39)&&abs(xspeed)<=10){xspeed+=0.5}
	if (keyIsDown(40)&&abs(speed)<=10){speed-=0.5}
								 

	if (keyIsDown(37)){r+=1.5}
	if (keyIsDown(39)){r-=1.5}
								 
xspeed=-speed*sin(r)
zspeed=-speed*cos(r)
	
	//if (keyIsDown(87)&&abs(zspeed)<=13){zspeed-=1}

	//　台
	pop()
push()
		translate (0,height/2-10,-200)
	fill("green")
	if(j==0){box(500,20,20000)}
	
pop()
	
			for (let i=0; i< moveplatsy.length;i++){
moveplatsy[i].move();
} 
				for (let i=0; i< moveplatsx.length;i++){
moveplatsx[i].move();
} 
	
			for (let i=0; i< moveplatsz.length;i++){
moveplatsz[i].move();
} 
	
	if (fly==0){yspeed=0}
	if (keyIsDown(32)) {fly=1}
if(fly==1){yspeed+=0.5;}
	if (keyIsDown(82)) {x=checkx;y=checky;z=checkz;reset()}
	if (keyIsDown(82)&&keyIsDown(16)) {checkx=0;checkz=0;checky=0;x=0;y=0;z=0;reset()}
	
	//plat(0,240,-200,40,40,40)
	spike(0,240,-700,200,40,40)
	check(0,250,-900,470,10,40)
	spike(0,240,-1200,500,40,40)
	plat(0,180,-1400,100,20,70)
	plat(0,110,-1550,100,20,70)
	plat(0,50,-1700,100,20,70)
//spike(0,270,-1750,500,40,600)
	check(0,120,-2000,200,10,60)
	plat(0,130,-2000,300,10,300)
	plat(0,180-50,-2400,100,20,70)
	plat(-200,110-50,-2550,100,20,70)
	plat(50,50-50,-2700,150,20,70)
	plat(0,200,-3000,500,150,20)
	check(0,250,-3200,500,20,20)
	spike(0,230,-3500,500,60,20)
	spike(0,230,-3600,500,70,20)
	spike(0,230,-3700,500,80,20)
	plat(0,180,-3900,100,20,100)
if (t<=120){
	plat(-100,120,-4100,100,20,100)
  plat(100,100,-4900,100,20,100)}
if (t>=120){
	spike(-100,120,-4100,100,20,100)
	spike(100,100,-4900,100,20,100)
}if (t>=240){t=0}
	plat(-200,80,-4300,100,20,100)
	plat(-100,40,-4500,100,20,100)
	plat(20,-10,-4700,100,20,100)
	check(20,-20,-4700,40,20,40)
  plat(150,50,-5200,100,20,100)
  plat(0,200,-5300,500,120,20)
  check(0,240,-5400,500,20,20)
  spike(0,250,-6200,500,20,800)
  plat(0,225,-5900,30,40,30)
  plat(100,225,-6000,30,40,30)
  plat(200,225,-6200,30,40,30)
  plat(50,225,-6300,30,40,30)
  plat(-50,225,-6600,30,40,30)
  plat(0,100,-7350,100,20,100)
  check(0,90,-7350,40,20,40)
  spike(0,90,-7750,400,20,20)
  spike(0,90,-7850,400,20,20)
  spike(0,90,-7950,400,20,20)
  plat(0,100,-8200,200,20,200)
  check(0,90,-8200,60,20,60)
  plat(0,160,-10200,600,200,20)
  plat(0,200,-9000,500,150,20)
  check(0,240,-10000,500,20,20)
	if(isNaN(x)){x=0}
	if(isNaN(y)){y=240}
	if(isNaN(z)){z=-10000}
	
	
	for(let i=2;i<checks.length;i+=3){
	if(checks[i]<checkz+100&&checks[i]>checkz-100){d=i+1}
		
	
	}
	if (keyIsDown(83)&&stt==0){checkx=checks[d];checky=checks[d+1];checkz=checks[d+2];stt=1;x=checkx;y=checky;z=checkz;reset()}
	if(!keyIsDown(83)) {stt=0}
								 
//     x, y,  z  , w ,h,  d
if(j==0){
text3("Welcome to 3D Platformer",0,150,-120)
text3("Arrow keys to move",0,200,-120)
text3("Space to jump",0,200,-400)
text3("Spikes will kill you",0,200,-700)
text3("This is a check point",0,120,-900)
text3("Press r to go to your latest checkpoint",0,170,-900)
text3("Press s to skip to the next checkpoint",0,210,-900)
text3("Shift+r to reset your progress",0,200,-1100)
push()
textFont(f2)
textSize(24)
text3("Congratulations!  You completed the 3D Platformer!",0,90,-10188)
 textSize(20)
text3("Please heart this because I worked really hard on this",0,120,-10189)
text3("Thanks to these people for hearting this: (scroll to see all of them)",0,140,-10189)

text3("list removed for fps reasons but thanks for "+rawJSON.sketch.hearts.length+" hearts!",0,180,-10189)

	
pop()}

		
	
	
	
	push()
	translate (x-11,y-30,z+16)
//text(round(z),0,0)

pop()	;pop()
}
}

function text3 (tt,xx,yy,zz){push()
textAlign(CENTER)
translate(xx,yy,zz)
	text(tt,0,0)
pop()
}

function plat (xx,yy,zz,ww,hh,dd){
		//text(y,0,100)
	push()
	fill(0, 209, 7)
	translate(xx,yy,zz)

	if(j==0){box(ww,hh,dd)}
pop()
//if (x>xx-ww/2-15&&x<xx+ww/2+15&&z>zz-dd/2-15&&z<zz+dd/2+15&&y>yy-hh/2-15&&y<yy+hh/2+15) {}
	
if (x>xx-ww/2-15&&x<xx+ww/2+15&&z>zz+dd/2&&z<zz+dd/2+15&&y>yy-hh/2&&y<yy+hh/2+15) {z=zz+dd/2+15}// front
if (x>xx-ww/2-15&&x<xx+ww/2+15&&z>zz-dd/2-15&&z<zz-dd/2&&y>yy-hh/2&&y<yy+hh/2+15) {z=zz-dd/2-15}// back
if (x>xx-ww/2-15&&x<xx-ww/2&&z>zz-dd/2-15&&z<zz+dd/2+15&&y>yy-hh/2&&y<yy+hh/2+15) {x=xx-ww/2-15}// left side
if (x>xx+ww/2&&x<xx+ww/2+15&&z>zz-dd/2-15&&z<zz+dd/2+15&&y>yy-hh/2&&y<yy+hh/2+15) {x=xx+ww/2+15}// right side	
if (x>xx-ww/2-15&&x<xx+ww/2+15&&z>zz-dd/2-15&&z<zz+dd/2+15&&y>yy-hh/2-15&&y<yy-hh/2) {y=yy-hh/2-15;if(keyIsDown(32)){yspeed=-10} else{yspeed=0}} else{}// top
if (x>xx-ww/2-15&&x<xx+ww/2+15&&z>zz-dd/2-15&&z<zz+dd/2+15&&y>yy+hh/2&&y<yy+hh/2+15) {y=yy+hh/2+15;yspeed=0}
}


function check (xx,yy,zz,ww,hh,dd){
		//text(y,0,100)
	checks.push(xx,yy-20,zz)
	push()
	fill(255, 255, 0)
	translate(xx,yy,zz)
stroke(240, 240, 0)
	if(j==0){box(ww,hh,dd)}
pop()
if (x>xx-ww/2-15&&x<xx+ww/2+15&&z>zz-dd/2-15&&z<zz+dd/2+15&&y>yy-hh/2-15&&y<yy+hh/2+15) {checkx=x;checky=y;checkz=z}
	

}


function spike (xx,yy,zz,ww,hh,dd){
		//text(y,0,100)
	push()
	fill(255, 0, 0)
	translate(xx,yy,zz)

	if(j==0){box(ww,hh,dd)}

pop()
if (x>xx-ww/2-15&&x<xx+ww/2+15&&z>zz-dd/2-15&&z<zz+dd/2+15&&y>yy-hh/2-15&&y<yy+hh/2+15) {x=checkx;y=checky;z=checkz;reset();deaths++}
	

}


function reset (){
yspeed=0;xspeed=0;zspeed=0;r=0
}



function Moveplaty (xx,yy,zz,ww,hh,dd,yh,ss){
	this.y=yy
	this.yspeed=ss
	
	this.move=function(){push()
		
		translate(xx,this.y,zz)
	fill(0, 209, 7)
	if(j==0){box(ww,hh,dd)}

		
		if (x>xx-ww/2-15&&x<xx+ww/2+15&&z>zz+dd/2&&z<zz+dd/2+15&&y>this.y-hh/2&&y<this.y+hh/2+15) {z=zz+dd/2+15}// front
if (x>xx-ww/2-15&&x<xx+ww/2+15&&z>zz-dd/2-15&&z<zz-dd/2&&y>this.y-hh/2&&y<this.y+hh/2+15) {z=zz-dd/2-15}// back
if (x>xx-ww/2-15&&x<xx-ww/2&&z>zz-dd/2-15&&z<zz+dd/2+15&&y>this.y-hh/2&&y<this.y+hh/2+15) {x=xx-ww/2-15}// left side
if (x>xx+ww/2&&x<xx+ww/2+15&&z>zz-dd/2-15&&z<zz+dd/2+15&&y>this.y-hh/2&&y<this.y+hh/2+15) {x=xx+ww/2+15}// right side	
if (x>xx-ww/2-15&&x<xx+ww/2+15&&z>zz-dd/2-15&&z<zz+dd/2+15&&y>this.y-hh/2-15&&y<this.y-hh/2) {y=this.y-hh/2-15;if(keyIsDown(32)){yspeed=-10} else{yspeed=0}} else{}// top
if (x>xx-ww/2-15&&x<xx+ww/2+15&&z>zz-dd/2-15&&z<zz+dd/2+15&&y>this.y+hh/2&&y<this.y+hh/2+15) {y=this.y+hh/2+15;yspeed=0}
		
		
		this.y+=this.yspeed
	//	if (this.y==yy) {this.yspeed=ss}
		if (this.y>yy) {this.yspeed=-this.yspeed}
		if (this.y<yh) {this.yspeed=-this.yspeed}
		
		pop()
}}



function Moveplatx (xx,yy,zz,ww,hh,dd,xl,ss){
	this.x=xx
	this.xspeed=ss
	
	this.move=function(){push()
		
		translate(this.x,yy,zz)
	fill(0, 209, 7)
	if(j==0){box(ww,hh,dd)}

		if (x>this.x-ww/2-15&&x<this.x+ww/2+15&&z>zz-dd/2-15&&z<zz+dd/2+15&&y>yy-hh/2-15&&y<yy+hh/2+15) {x+=this.xspeed}
		if (x>this.x-ww/2-15&&x<this.x+ww/2+15&&z>zz+dd/2&&z<zz+dd/2+15&&y>yy-hh/2&&y<yy+hh/2+15) {z=zz+dd/2+15}// front
if (x>this.x-ww/2-15&&x<this.x+ww/2+15&&z>zz-dd/2-15&&z<zz-dd/2&&y>yy-hh/2&&y<yy+hh/2+15) {z=zz-dd/2-15}// back
if (x>this.x-ww/2-15&&x<this.x-ww/2&&z>zz-dd/2-15&&z<zz+dd/2+15&&y>yy-hh/2&&y<yy+hh/2+15) {x=this.x-ww/2-15}// left side
if (x>this.x+ww/2&&x<this.x+ww/2+15&&z>zz-dd/2-15&&z<zz+dd/2+15&&y>yy-hh/2&&y<yy+hh/2+15) {x=this.x+ww/2+15}// right side	
if (x>this.x-ww/2-15&&x<this.x+ww/2+15&&z>zz-dd/2-15&&z<zz+dd/2+15&&y>yy-hh/2-15&&y<yy-hh/2) {y=yy-hh/2-15;if(keyIsDown(32)){yspeed=-10} else{yspeed=0}} else{}// top
if (x>this.x-ww/2-15&&x<this.x+ww/2+15&&z>zz-dd/2-15&&z<zz+dd/2+15&&y>yy+hh/2&&y<yy+hh/2+15) {y=yy+hh/2+15;yspeed=0}
		
		
		this.x+=this.xspeed
		// if (this.x==xx) {this.xspeed=ss}
		if (this.x>xx) {this.xspeed=-this.xspeed}
		if (this.x<xl) {this.xspeed=-this.xspeed}
		
		pop()
}}

function Moveplatz (xx,yy,zz,ww,hh,dd,zd,ss){
	this.z=zz
	this.zspeed=ss
	
	this.move=function(){push()
		
		translate(xx,yy,this.z)
	fill(0, 209, 7)
		if(j==0){box(ww,hh,dd)}

		if (x>xx-ww/2-15&&x<xx+ww/2+15&&z>this.z-dd/2-15&&z<this.z+dd/2+15&&y>yy-hh/2-15&&y<yy+hh/2+15) {z+=this.zspeed}
		if (x>xx-ww/2-15&&x<xx+ww/2+15&&z>this.z+dd/2&&z<this.z+dd/2+15&&y>yy-hh/2&&y<yy+hh/2+15) {z=this.z+dd/2+15}// front
if (x>xx-ww/2-15&&x<xx+ww/2+15&&z>this.z-dd/2-15&&z<this.z-dd/2&&y>yy-hh/2&&y<yy+hh/2+15) {z=this.z-dd/2-15}// back
if (x>xx-ww/2-15&&x<xx-ww/2&&z>this.z-dd/2-15&&z<this.z+dd/2+15&&y>yy-hh/2&&y<yy+hh/2+15) {x=xx-ww/2-15}// left side
if (x>xx+ww/2&&x<xx+ww/2+15&&z>this.z-dd/2-15&&z<this.z+dd/2+15&&y>yy-hh/2&&y<yy+hh/2+15) {x=xx+ww/2+15}// right side	
if (x>xx-ww/2-15&&x<xx+ww/2+15&&z>this.z-dd/2-15&&z<this.z+dd/2+15&&y>yy-hh/2-15&&y<yy-hh/2) {y=yy-hh/2-15;if(keyIsDown(32)){yspeed=-10} else{yspeed=0}} else{}// top
if (x>xx-ww/2-15&&x<xx+ww/2+15&&z>this.z-dd/2-15&&z<this.z+dd/2+15&&y>yy+hh/2&&y<yy+hh/2+15) {y=yy+hh/2+15;yspeed=0}
		
		
		this.z+=this.zspeed
		if (this.z==zz) {this.zspeed=ss}
		if (this.z<zz) {this.zspeed=-this.zspeed}
		if (this.z>zd) {this.zspeed=-this.zspeed}
		
		pop()
}}

function mouseWheel(event) {
  // yy-=event.delta
}
