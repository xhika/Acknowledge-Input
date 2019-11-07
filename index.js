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


// Declarations
const video = document.querySelector('video');
const input = document.querySelector('input');
const trainBtn = document.querySelector('button.train');
const camera = document.getElementById('camera');


const modelReady = () => {
	console.log('Model is ready!');
}

// Adds example to classifier
const addExample = (label) => {
	console.log('Adding example to classifier')
	// Get features from the image
	const logits = features.infer(canvas);

	// Adds example to KNN classifier with label from input
	knn.addExample(logits, label);
}

// Classify frame
const classifyImage = () => {

	const logits = features.infer(canvas);
	
	// Using KNN to classify features
	knn.classify(logits, (error, results) => {
		if(!error) {
			const h2 = document.getElementById('show_result');
			console.log(results)
			if(h2.textContent === '') {
				h2.append(input.value);
				h2.classList = 'w-4/5 sm:w-3/5 text-center bg-green-600 text-white font-bold py-2 px-4 rounded relative z-40';
			} else if(h2.textContent !== '') {
				h2.textContent = '';
				h2.append(input.value);
			} else {
				return;
			}
			// knn.save();
		} else {
			console.error(error);
		}

	});
	// console.log('Logits: ', logits);
	// console.log(logits.dataSync());
}
const clearLabel = (label) => {
	knn.clearLabel(label);
	console.log('input', input.value)
	input.value = '';
}

// Open camera on click
camera.addEventListener('click', (e) => {
	console.log('Open camera');
	openCamera();
})

// Open and handle camera
const openCamera = () => {
	const image = document.createElement('img');

	// Get access to the camera!
	if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

		// Setting constraints for camera
		const constraints = {
  			video: {
  				width: {
  					min: 1280,
  					ideal: 1920,
  					max: 2560
  				}, 
  				height: {
  					min: 720,
  					ideal: 1080,
  					max: 1440
  				},
  			}
		};
		
	    navigator.mediaDevices.getUserMedia(constraints)
	    .then(function(stream) {
	        video.srcObject = stream;
	        video.play();
	        console.log('Camera ready!');

	        trainBtn.addEventListener('click', (e) => {
	        	takeSnapshot();
	        	addExample(input.value);
	        	classifyImage();

	        	console.log('TRAINING');
	
			});
	    })
	    .catch(function(error) {
	    	console.error(error);
	    })
	};

	// Take a snapshot
	const takeSnapshot = () => {
		console.log('Taking Snapshot')

		context.drawImage(video, 0, 0, canvas.width, canvas.height);

		const imageDataURL = canvas.toDataURL('image/png');
		image.src = imageDataURL;

		// console.log(image.src)
	}
}



// Declaring ml5 models and methods

// Creates a KNN classifier
const knn = ml5.KNNClassifier();

// Calling the image method with MobileNet model
const mobileNet = ml5.imageClassifier('MobileNet', modelReady());

// Extract the already learned features from MobileNet
const features = ml5.featureExtractor('MobileNet', modelReady());

const saveKnn = () => {
	knn.save('KNNData');
}
const loadKnn = () => {
	knn.load('./KNNdata.json');
}