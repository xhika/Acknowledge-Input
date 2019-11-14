'use strict';

// Create canvas
const canvas = document.createElement('canvas');
document.body.append(canvas);

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
const camera = document.getElementById('camera_button');
const image = document.createElement('img');


const modelReady = () => {
	console.log('Model is ready!');
}

// Adds example to classifier
const addExample = (label) => {
	console.log('Adding EXAMPLE')
	// Get features from the image
	const logits = features.infer(canvas);

	// Adds example to KNN classifier with label from input
	knn.addExample(logits, label);

	const h2 = document.getElementById('show_input')

	if(h2.innerHTML === '') {
		h2.append(label);
		h2.classList = 'w-4/5 sm:w-3/5 text-center bg-green-600 text-white font-bold py-2 px-4 rounded';
	} else if(h2.innerHTML !== '') {
		h2.innerHTML = '';
		h2.append(label);
	} else {
		return;
	}

}

const sleep = (ms) => {
	return new Promise(res => setTimeout(res,ms));
}
const readCamera = (results, input) => {
	const counts = knn.getCountByLabel();
	// console.log(counts)
}

// Classify frame
const classifyImage = async() => {
	const numLabels = knn.getNumLabels();
	console.log('testing', numLabels)
	if(numLabels > 0) {
		const logits = features.infer(video);
		// Setting k value
		const k = 3;
		// Using KNN to classify features
		knn.classify(logits, k, (error, results) => {
			if(!error) {
				showPrediction(results);
				// knn.save();
			} else {
				console.error(error);
			}
		});
		// console.log('Logits: ', logits);
		// console.log(logits.dataSync());
	}

	await sleep(3000);
	classifyImage();
}
const clearLabel = (label) => {
	knn.clearLabel(label);
	console.log('input', input.value)
	input.value = '';
}

const showPrediction = async(results) => {
	const cameraDiv = document.getElementById('camera_div');
	const h1 = document.getElementById('results')

	const obj = results.confidencesByLabel;
	const keys = Object.keys(obj);
	const values = Object.values(obj);

	console.log('values: ', values);
	console.log('keys: ', keys);
	console.log('Knn Classifier results: ', results);
		
	if(h1.textContent === '') {
		cameraDiv.appendChild(h1);
		h1.append(results.label);
		h1.classList = 'w-full text-center bg-black text-white font-bold py-2 px-4';
	} else if(h1.textContent !== '') {
		h1.textContent = ''
		h1.append(results.label)
	} else {
		return
	}
}

// Open camera on click
camera.addEventListener('click', (e) => {
	console.log('Open camera');
	openCamera();
})

const hideBtn = (button) => {
	button.classList = 'hidden';
}

const showBtn = (input, button) => {
	input.classList += 'block';
	button.classList += 'block';
}

// Open and handle camera
const openCamera = () => {



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
	        if(video.srcObject.active === true) {

        		console.log('Camera ready!');
        		hideBtn(camera);
        		showBtn(input, trainBtn);

        		classifyImage();

	        }
	        
	        trainBtn.addEventListener('click', (e) => {
        		if (input.value === '') {
					console.log('empty!')
					return;
				} else {
		        	takeSnapshot();
		        	addExample(input.value);
		        	// classifyImage();
				}

	        	console.log('TRAINING');
	
			});
	    })
	    .catch(function(error) {
	    	console.error(error);
	    })
	};

}
// Take a snapshot
const takeSnapshot = () => {
	console.log('Taking Snapshot')
	const h3 = document.querySelector('h3');
	h3.classList = 'flex justify-center mt-8 font-sans';
	context.drawImage(video, 0, 0, canvas.width, canvas.height);
	const imageDataURL = canvas.toDataURL('image/png');
	image.src = imageDataURL;
	// console.log(image.src)
}




// Declaring ml5 models and methods

// Creates a KNN classifier
const knn = ml5.KNNClassifier();

// Calling the image method with MobileNet model
const mobileNet = ml5.imageClassifier('MobileNet', modelReady);

// Extract the already learned features from MobileNet
const features = ml5.featureExtractor('MobileNet', modelReady);

const saveKnn = () => {
	knn.save('KNNData');
}
const loadKnn = () => {
	knn.load('./KNNdata.json');
}