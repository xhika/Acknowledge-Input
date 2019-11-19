'use strict';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}


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
const infoBox = document.querySelector('.info_box');
const camera = document.getElementById('camera_button');
const image = document.createElement('img');
const cameraDiv = document.getElementById('camera_div');

const modelReady = () => {
	console.log('Model is ready!');
}

const createCache = (data, label) => {
    const options = {
        headers: {
            'Content-Type': 'application/json',
        }
    }

    caches.open('knnDataCache').then((cache) => {
        //console.log(data)
        let content = {};

        const request = new Request('/logits')
        cache.match(request).then(async (response) => {
            if (response !== undefined) {
                await response.json().then((json) => {
                    content = json
                });
            }

            content[label] = data
            let cacheData = JSON.stringify(content)

            // let cacheData = JSON.stringify(
            //     Array.isArray(content)
            //         ? [...content, data]
            //         : [content, data]
            // )

            const jsonRes = new Response(cacheData, options);
            cache.put('logits', jsonRes)
            // console.log(content)
        });
    });
}

const loadCache = () => {
    const request = new Request('/logits')
    caches.open('knnDataCache').then((cache) => {
        cache.match(request).then((responses) => {
            // console.log(responses)
            responses.json().then((json) => {
                const retrievedCache = json
                console.log(retrievedCache)
            });
            // console.log(`There are ${responses.length} matching responses.`);
        });
    });
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
    const logitData = logits.dataSync()
    createCache(logitData, label);
}

const sleep = (ms) => {
	return new Promise(res => setTimeout(res,ms));
}

// Classify video
const classifyImage = async() => {
	const numLabels = knn.getNumLabels();
	// Run function if labels exists
	if(numLabels > 0) {
		const logits = features.infer(video);
		// Setting k value
		const k = 3;
		// Using KNN to classify features
		knn.classify(logits, k, (error, results) => {
			if(!error) {
				showPrediction(results);
			} else {
				console.error(error);
			}
		});
		// console.log('Logits: ', logits);
		// console.log(logits.dataSync());
	}
	// Using sleep function to avoid crash while looping
	await sleep(500);
	classifyImage();
}

const showPrediction = async(results) => {
    const label = results.label;
	const h1 = document.getElementById('results')
	// const obj = results.confidencesByLabel;
	// const keys = Object.keys(obj);
	// const values = Object.values(obj);
    // logits = logits.dataSync();
	// console.log('Knn Classifier results: ', results);

	if(h1.textContent === '') {
		cameraDiv.appendChild(h1);
		h1.append(label);
		h1.classList = 'w-full text-center bg-black text-white font-bold py-2 px-4';
	} else if(h1.textContent !== '') {
		h1.textContent = ''
		h1.append(label)
	} else {
		return
	}
}

// Open camera on click
camera.addEventListener('click', (e) => {
	// console.log('Open camera');
	openCamera();
    loadCache();
})

const hideElement = (button, box) => {
	button.classList = 'hidden';
    box.classList = 'hidden';
}

const showElement = (input, button) => {
	input.classList += 'block';
	button.classList += 'block';
}
let supports = navigator.mediaDevices.getSupportedConstraints();
    if(supports['facingMode'] === true ) {
        video.disabled = false;
    }


// Open and handle camera
const openCamera = () => {
    let supports = navigator.mediaDevices.getSupportedConstraints();
    if(supports['facingMode'] === true) {
        video.disabled = false;
    }
	// Get access to the camera!
	if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let shouldFaceUser = true;
		// Setting constraints for camera
		const constraints = {
  			video: {
  				width: {
  					min: 320,
  					ideal: 1280,
  					max: 1920
  				},
  				height: {
  					min: 600,
  					ideal: 720,
  					max: 1080
  				},
            facingMode: shouldFaceUser ? 'user' : 'environment'
  			},
		};
	    navigator.mediaDevices.getUserMedia(constraints)
	    .then(function(stream) {
	        video.srcObject = stream;
	        video.play();
	        if(video.srcObject.active === true) {

        		// console.log('Camera ready!');
                video.setAttribute('width', '100%');
        		hideElement(camera, infoBox);
        		showElement(input, trainBtn);
        		classifyImage();
	        }

	        trainBtn.addEventListener('click', (e) => {
        		if (input.value === '') {
					// console.log('empty!')
					return;
				} else {
		        	takeSnapshot();
		        	addExample(input.value);
				}
	        	// console.log('TRAINING');
			});

            const capture = () => {
                    constraints.video = { facingMode: shouldFaceUser ? 'user' : 'environment' }
                    navigator.mediaDevices.getUserMedia(constraints)
                .then(function(_stream) {
                    stream  = _stream;
                    video.srcObject = stream;
                    video.play();
                })
                .catch(function(err) {
                    console.log(err)
                });
            }
            video.addEventListener('dblclick', (e) => {
                if(stream == null) return
                    stream.getTracks().forEach(t => {
                        t.stop();
                    })
                shouldFaceUser = !shouldFaceUser
                capture();
            })
	    })
	    .catch(function(error) {
	    	console.error(error);
	    })
	};
}
// Take a snapshot
const takeSnapshot = () => {
	// console.log('Taking Snapshot')
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

// Extract the already learned features from MobileNet
const features = ml5.featureExtractor('MobileNet', modelReady);


