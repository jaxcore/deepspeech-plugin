let Speech = require('./speech');

// let deepspeech = require('deepspeech');
// let vad = require('node-vad');

let modelPath = process.argv[3];
let modelName = process.argv[5];

// console.log('SPEECH PROCESS modelName=', modelName, 'modelPath=', modelPath);
// console.log('SPEECH PROCESS deepspeech', deepspeech);
// console.log('SPEECH PROCESS vad', vad);
// console.log('SPEECH PROCESS Speech', Speech);

let options = {
	models: {}
};
options.models[modelName] = {
	path: modelPath
};

let speech = new Speech(options);

speech.on('recognize', function (text, stats) {
	console.log('Recognized Text:', text);
	
	process.send({
		recognize: {
			text,
			stats
		}
	});
});

speech.on('start-continuous', function (stats) {
	console.log('start-continuous');
	process.send({
		continuousStart: {
			stats
		}
	});
});

speech.on('stop-continuous', function (stats) {
	console.log('stop-continuous');
	process.send({
		continuousStop: {
			stats
		}
	});
});

speech.on('start', function (stats) {
	console.log('start');
	process.send({
		start: {
			stats
		}
	});
});
speech.on('stop', function (stats) {
	console.log('stop');
	process.send({
		stop: {
			stats
		}
	});
});

process.on('message', function (msg, n) {
	console.log('message from main:', msg, n); //this is never reached
	
	if (msg === 'cancel') speech.cancel();
	if (msg === 'start') speech.start();
	if (msg === 'stop') speech.start();
	if (msg === 'start-continuous') speech.startContinuous();
	if (msg === 'stop-continuous') speech.startContinuous();
});

let count = 0;
setInterval(function () {
	console.log('child sent :', count++);
	
	process.send({count: count});
}, 1000);

process.send(true);

speech.startContinuous();