const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();
// jaxcore.addPlugin(require('jaxcore-deepspeech-plugin'));
jaxcore.addPlugin(require('../../'));

const BumbleBee = require('bumblebee-hotword-node');
const bumblebee = new BumbleBee();
bumblebee.addHotword('bumblebee');

const {playOn, playOff} = require('./sounds');

let speechRecognitionActive = false;

jaxcore.startService('deepspeech', {
	modelName: 'english',
	modelPath: process.env.DEEPSPEECH_MODEL || __dirname + '/../../deepspeech-0.7.3-models', // path to deepspeech model,
	silenceThreshold: 200, // how many milliseconds of silence before processing the audio
	vadMode: 'VERY_AGGRESSIVE', // options are: 'NORMAL', 'LOW_BITRATE', 'AGGRESSIVE', 'VERY_AGGRESSIVE'
	debug: true
}, function(err, deepspeech) {
	
	deepspeech.on('recognize', (text, stats) => {
		console.log('Speech Recognition Result:', text);
	});
	
	bumblebee.on('hotword', function(hotword) {
		if (speechRecognitionActive) {
			console.log('\nSPEECH RECOGNITION OFF');
			console.log('\nStart speech recognition by saying:', 'BUMBLEBEE');
			playOff();
			speechRecognitionActive = false;
		}
		else if (!speechRecognitionActive) {
			console.log('\nSPEECH RECOGNITION ON');
			console.log('Stop speech recognition by saying:', 'BUMBLEBEE');
			playOn();
			speechRecognitionActive = true;
		}
		deepspeech.streamReset(); // reset deepspeech to ignore speech recognition of the hotword that was spoken
	});
	
	bumblebee.on('data', function (intData, sampleRate, hotword, float32arr) {
		if (speechRecognitionActive) {
			deepspeech.dualStreamData(intData, float32arr, 16000);
		}
	});
	
	bumblebee.start();
	
	console.log('\nStart speech recognition by saying:', 'BUMBLEBEE');
});