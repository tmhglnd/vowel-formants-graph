
var cnv;
var margin = 50;

var minHzX = 100;
var maxHzX = 1000;
var minHzY = 300;
var maxHzY = 3000;

var radius = 8;
var size = 22;

var data = [];
var dataSet = {};
var freqs = [0, 0, 0];

var boxes = [];

var files = [
	// 'formants-0-test'
	'formants-1-female',
	'formants-1-male',
	'formants-2',
	'formants-3-subject',
	'formants-3-model',
	'formants-4',
	'formants-5-female',
	'formants-5-male',
	'formants-7',
	'formants-8-female',
	'formants-8-male',
	'formants-constructed'
];

let osc1;
let osc2;
let bPass1;
let bPass2;
let bPass3;
let bandWidth = 60;

let isPlaying = false;

function preload(){
	for (var f=0; f<files.length; f++){
		var file = "assets/" + files[f] + ".json";
		files[f] = file;

		dataSet[file] = loadJSON(file, (obj) => {
			console.log("loaded", file);
		});
	}
}

function setup(){		
	Object.keys(dataSet).forEach((key) => {
		var i = Object.keys(dataSet).indexOf(key);
		var c = [ i * 360/files.length, 100, 70, 0.8];
		
		Object.keys(dataSet[key]).forEach((vowel) => {
			var d = dataSet[key][vowel];
			// console.log(d);
			d[3] = (d.length > 3) ? d[3] : "";
			data.push(new dataPoint(vowel, d[0], d[1], d[2], d[3], c, key));
		});
	});

	cnv = createCanvas(windowWidth, windowHeight-200);
	cnv.mousePressed(makeSound);

	for (var f=0; f<files.length; f++){
		boxes[f] = createCheckbox(files[f]);
		boxes[f].changed(displayData);
	}

	osc1 = new p5.SqrOsc();
	osc2 = new p5.SqrOsc();
	osc3 = new p5.SqrOsc();
	bPass1 = new p5.BandPass();
	bPass2 = new p5.BandPass();
	bPass3 = new p5.BandPass();

	osc1.disconnect();
	osc2.disconnect();
	osc3.disconnect();
	osc1.connect(bPass1);
	osc2.connect(bPass2);
	osc3.connect(bPass3);
	osc1.freq(87);
	osc2.freq(87);
	osc3.freq(87);
	osc1.amp(0);
	osc2.amp(0);
	osc3.amp(0);
}

function windowResized(){
	resizeCanvas(windowWidth, windowHeight-200);
}

function draw(){
	colorMode(RGB);
	background(25);
	
	translate(margin, margin);

	graphAxis();
	graphScale();
	
	for (let p in data){
		data[p].display();
	}
	for (let p in data){
		if (data[p].hover()){
			freqs = data[p].getFreqs();
			bPass3.freq(freqs[2]);
			bPass3.res(freqs[2] / bandWidth * 2);
		}
	}
	
	if (isPlaying){
		osc1.amp(1, 0.1);
		osc2.amp(0.6, 0.1);
		osc3.amp(0.25, 0.1);
	}

	mouseValues();
}

function makeSound(){
	if (!isPlaying){
		osc1.start();
		osc2.start();
		osc3.start();
		isPlaying = true;
	}
}

function mouseReleased(){
	osc1.amp(0, 0.2);
	osc2.amp(0, 0.2);
	osc3.amp(0, 0.2);
	isPlaying = false;
}

function graphAxis(){
	var m = margin * 2;

	colorMode(RGB);
	stroke(100);
	line(0, 0, width-m, 0);
	line(0, height-m, width-m, height-m);

	line(0, 0, 0, height-m);
	line(width-m, 0, width-m, height-m);
}

function graphScale(){
	var m = margin * 2;

	var div = 10;
	
	for (let i=0; i<div; i++){
		let x = i * (width-m) / div;
		let y = i * (height-m) / div;
		stroke(80);
		line(x, 0, x, height-m);
		line(0, y, width-m, y);

		var f1 = map(i, 0, div, minHzX, maxHzX);
		var f2 = map(i, 0, div, minHzY, maxHzY);

		noStroke();
		fill(255);
		textAlign(LEFT, BOTTOM);
		textSize(15);
		text(f1, x, -5);

		textAlign(RIGHT, TOP);
		text(f2, -5, y);
	}
}

function mouseValues(){

	translate(-margin/2, -margin/2);
	// noStroke();
	strokeWeight(2);
	stroke(0);
	fill(255);
	textSize(18);
	textAlign(LEFT, TOP);

	let f1 = map(mouseX, margin, width-margin, minHzX, maxHzX);
	let f2 = map(mouseY, margin, height-margin, minHzY, maxHzY);
	let f3 = freqs[2];

	text("{ " + f1.toFixed() + ", " + f2.toFixed() + ", " + f3.toFixed() + " }", mouseX, mouseY);

	bPass1.freq(f1);
	bPass2.freq(f2);

	bPass1.res(f1 / bandWidth * 2);
	bPass2.res(f2 / bandWidth * 2);
	// bPass3.res();

}

function displayData(){
	for (let d in data){
		data[d].visible(this.value(), this.checked());
	}
}

class dataPoint {
	constructor(n, f1, f2, f3, n2="", c, s) {
		this.data = s;
		this.freq1 = f1;
		this.freq2 = f2;
		this.freq3 = f3;
		this.x = 0;
		this.y = 0;
		this.name = n;
		this.name2 = n2;
		this.color = c;
		this.tmpC = c;
		this.isVisible = false;
		// console.log('dataPoint()', this.data, this.name);
	}

	display(){
		if (this.isVisible){
			colorMode(HSL);
			
			strokeWeight(2);
			stroke(this.color);
			noFill()
			this.x = map(this.freq1, minHzX, maxHzX, 0, width-(margin*2));
			this.y = map(this.freq2, minHzY, maxHzY, 0, height-(margin*2));
			ellipse(this.x, this.y, radius, radius);
			
			noStroke();
			fill(this.color);
			textSize(size);
			textAlign(LEFT, BOTTOM);

			if (this.name2 !== ""){
				text(this.name + " [" + this.name2 + "]", this.x+radius/2, this.y);
			} else {
				text(this.name, this.x+radius/2, this.y);
			}
		}
	}

	visible(_set, _visible){
		if (_set === this.data){
			this.isVisible = _visible;
		}
	}

	hover(){
		let mX = mouseX-margin;
		let mY = mouseY-margin;
		let r = radius/2;
		// console.log(this.x, this.y, mouseX-margin, mouseY-margin);
		if (mX < this.x+r && mY < this.y+r && mX > this.x-r && mY > this.y-r){
			this.color = [0, 100, 100];
			return true;
		} else {
			this.color = this.tmpC;
			return false;
		}
	}

	getFreqs(){
		return [this.freq1, this.freq2, this.freq3];
	}
}