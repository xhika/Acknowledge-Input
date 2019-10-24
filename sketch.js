let mobileNet;
let video;
let img;

// Loads the model and predict results with given image
function modelReady() {
	console.log('Model is ready!');
	mobileNet.predict(img, gotResults);
}

// Handle results
function gotResults(error, results) {
	if(!error) {
		console.log(results);
	} else {
		console.error(error);
	}
}

function imageReady() {
	image(img, 0, 0, width, height);
}

function setup() {
	createCanvas(640, 640);
	img = createImg('https://cdn.pixabay.com/photo/2019/04/25/20/52/amur-tiger-4155922_960_720.jpg', imageReady);
	img.hide();
	background(0);
	image(img, 0, 0);
	// Calling the image Classifier method with MobileNet model
	mobileNet = ml5.imageClassifier('MobileNet', modelReady);
}