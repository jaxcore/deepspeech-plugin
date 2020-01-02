const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();
jaxcore.addPlugin(require('jaxcore-deepspeech-plugin'));

const BumbleBee = require('bumblebee-hotword-node');
const bumblebee = new BumbleBee();
bumblebee.addHotword('bumblebee');

const {playOn, playOff} = require('./sounds');

const MODEL_PATH = __dirname + '/../../deepspeech-0.6.0-models'; // path to deepspeech model

let speechRecognitionActive = false;

jaxcore.startService('deepspeech', {
	modelName: 'english',
	modelPath: MODEL_PATH,
	silenceThreshold: 200, // how many milliseconds of silence before processing the audio
	vadMode: 'VERY_AGGRESSIVE', // options are: 'NORMAL', 'LOW_BITRATE', 'AGGRESSIVE', 'VERY_AGGRESSIVE'
}, function(err, deepspeech) {
	
	deepspeech.on('recognize', (text, stats) => {
		console.log('Speech Recognition Result:', text);
	});
	
	bumblebee.on('hotword', function(hotword) {
		if (speechRecognitionActive) {
			console.log('\nSPEECH RECOGNITION OFF');
			console.log('\nStart speech recognition by saying:', Object.keys(bumblebee.hotwords));
			playOff();
			speechRecognitionActive = false;
		}
		else if (!speechRecognitionActive) {
			console.log('\nSPEECH RECOGNITION ON');
			console.log('Stop speech recognition by saying:', Object.keys(bumblebee.hotwords));
			playOn();
			speechRecognitionActive = true;
		}
		deepspeech.streamReset(); // reset deepspeech to ignore speech recognition of the hotword that was spoken
	});
	
	bumblebee.on('data', function(data) {
		if (speechRecognitionActive) {
			deepspeech.streamData(data);
		}
	});
	
	bumblebee.start();
	
	console.log('\nStart speech recognition by saying:', Object.keys(bumblebee.hotwords));
});