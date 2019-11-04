'use strict';

// Create canvas
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

// Fetch the 2D context from the <canvas> element.
const context = canvas.getContext('2d');

// Get viewport
const width = window.innerWidth;
const height = window.innerHeight;

// Set viewport
canvas.height = height;
canvas.width = width;

// Support for retina
canvas.style.height = `${canvas.height / 2}px`;
canvas.style.width = `${canvas.width / 2}px`;

// Declarations
const video = document.querySelector('video');
const input = document.querySelector('input');
const trainBtn = document.querySelector('button.train');
const camera = document.getElementById('camera');


const modelReady = () => {
	console.log('Model is ready!');
}

// Handle results from snapshot
const gotResults = (error, results) => {
	if(!error) {
		console.log(results);
	} else {
		console.error(error);
	}
}

// Open camera on click
camera.addEventListener('click', e => {
	console.log('Open camera');
	openCamera();
})

// Open and handle camera
const openCamera = () => {
	const image = document.createElement('img');

	video.width = canvas.width;
	video.height = canvas.height;

	// Get access to the camera!
	if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
	    // Not adding `{ audio: true }` since we only want video now
	    navigator.mediaDevices.getUserMedia({ video: true })
	    .then(function(stream) {
	        //video.src = window.URL.createObjectURL(stream);
	        video.srcObject = stream;
	        video.play();
	        console.log('Camera ready!');

	        trainBtn.addEventListener('click', (e) => {
	        	takeSnapshot();
	        	console.log('TRAINING');

				// Get features from the image
				const logits = features.infer(canvas);

				// Adds example to KNN classifier with label from input
				knn.addExample(logits, input.value);

				// Using KNN to classify features
				knn.classify(logits, gotResults);
			});
	    })
	    .catch(function(error) {
	    	console.error(error);
	    })
	};

	// Take a snapshot
	const takeSnapshot = () => {
		console.log('Taking Snapshot')

		context.drawImage(video, 0, 0, width, height);


		const imageDataURL = canvas.toDataURL('image/png');
		image.setAttribute('src', imageDataURL);
		console.log(image.src)
	}
}


// Declaring ml5 models and methods

// Creates a KNN classifier
const knn = ml5.KNNClassifier();

// Calling the image method with MobileNet model
const mobileNet = ml5.imageClassifier('MobileNet', modelReady);

// Extract the already learned features from MobileNet
const features = ml5.featureExtractor('MobileNet', modelReady);