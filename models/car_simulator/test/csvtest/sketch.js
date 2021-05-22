/*
https://qiita.com/megadreams14/items/b4521308d5be65f0c544
*/

let records = [];

function parameters(){

    this.s = 0;
    this.recording = false;
    this.export = function(){

        // output 

        let data = records.map((record)=>record.join(',')).join('\r\n');
         
        let bom  = new Uint8Array([0xEF, 0xBB, 0xBF]);
        let blob = new Blob([bom, data], {type: 'text/csv'});
        let url = (window.URL || window.webkitURL).createObjectURL(blob);
        let link = document.createElement('a');
        link.download = 'result.csv';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        //array reset
        records = [];
    }

        // array reset
        records = [];
}

let param;

function setup(){
    console.log("hoge");
	createCanvas(windowWidth,windowHeight);
    frameRate(60);

	param = new parameters();
	// ----------------------- GUI Settings ---------------------------------------

	let gui = new dat.GUI();
    gui.add(param,"s",-1,1,0.01).listen();
    gui.add(param,"recording");
    gui.add(param,"export");
	gui.open();
    //------- --------------------------------------------------------------------
	
}
let time = 0;
function draw(){

    param.s = param.s + 0.01;
    time += 1/60;
    if(param.recording){
        records.push([time,Math.sin(param.s)]);
    }
}