let video;
let img;

let width = window.innerWidth;
let height = window.innerHeight;

// Calling the image method with MobileNet model
const mobileNet = ml5.imageClassifier('MobileNet', modelReady);
	
// Extract the already learned features from MobileNet
const features = ml5.featureExtractor('MobileNet', modelReady);

// Create a new classifier using those features and with a video element
/*const classifier = features.classification(video, videoReady);*/


const knn = ml5.KNNClassifier();


// Loads the model and predict results with given image
function modelReady() {
	console.log('Model is ready!');
	// mobileNet.predict(video, gotResults);
}
function predict() {
	mobileNet.predict(video, gotResults);
}

function mousePressed() {
	/*const logits = features.infer(video);
	knn.classify(logits, gotResults);
*/
}
function keyPressed() {
const logits = features.infer(video);
	if(key == 'a') {
		knn.addExample(logits, 'A');
		console.log('option A')
	} else if(key == 'b') {
		knn.addExample(logits, 'B');
		console.log('option B')
	} else {
		console.log('nothing')
	}
}

// Handle results
function gotResults(error, results) {
	if(!error) {
		console.log(results);
/*		console.log(logits);
		console.log(logits.dataSync());*/
	} else {
		console.error(error);
	}
}

function openCamera() {
	video = createCapture(VIDEO);
	video.size(width, height);
	cameraBtn.hide();
	/*canvas.hide();*/
	videoReady();
	modelReady();
}


function videoReady() {
  console.log("The video is ready!");
  	// Input field
	input = createInput('').attribute('placeholder', 'Describe your picture..');
	input.input(inputEvent);
	trainBtn = createButton('Train model');
	trainBtn.position(width / 2, height + 550);
	input.position(width / 2 - 50);
}


function windowResized() {
  resizeCanvas(width, height);
  // image(video, 0, 0, width, height);
}

function setup() {
	canvas = createCanvas(width, height);
 	
 	// Camera button
	cameraBtn = createButton('Camera');
	cameraBtn.position(width / 2 -50, height / 2);
	cameraBtn.size(100,100);
	cameraBtn.mousePressed(openCamera);
/*	cameraBtn.style('background-color', color)*/

	start = 'Open the camera to begin exploring!';
	textSize(32);
	fill(0);
	textAlign(CENTER, CENTER);
	
}

function inputEvent() {
	console.log('you are typing ', this.value());
	value = this.value();
	if (value !== '') {
		trainBtn.mousePressed(saveData);
	} else {
		console.log('empty!')
	}
}

function saveData() {
	console.log('Train clicked')
	const logits = features.infer(video);
	console.log(logits)
	knn.classify(logits, gotResults);
}

function draw() {
	background(255);
	text(start, width / 2, height / 3);	
}
