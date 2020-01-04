// use control system (jaxcore)
const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();

// use jaxcore deepspeech service (launches deepspeech in background process)
const DeepSpeechService = require('jaxcore-deepspeech-plugin');
jaxcore.addPlugin(DeepSpeechService);

// load hotword detection module (bumblebee-hotword-node)
const BumbleBee = require('bumblebee-hotword-node');
const bumblebee = new BumbleBee();
bumblebee.addHotword('bumblebee');

// load text-to-speech module (jaxcore-say-node)
const Say = require('jaxcore-say-node');
Say.speaker = require('speaker');

var voice = new Say({ language: 'en-us', profile: 'Jack' });

// path to deepspeech model
const MODEL_PATH = process.env.DEEPSPEECH_MODEL || __dirname + '/../../deepspeech-0.6.0-models';

let speechRecognitionActive = false;

jaxcore.startService('deepspeech', {
	modelName: 'english',
	modelPath: MODEL_PATH,
	silenceThreshold: 200, // how many milliseconds of silence before processing the audio
	vadMode: 'VERY_AGGRESSIVE', // options are: 'NORMAL', 'LOW_BITRATE', 'AGGRESSIVE', 'VERY_AGGRESSIVE'
	debug: 'true'
}, function(err, deepspeech) {
	
	deepspeech.on('recognize', (text, stats) => {
		console.log('Speech recognition result:', text);
		
		speechRecognitionActive = false;  // disable recognition while using text-to-speech
		voice.say(text).then(() => {
			// delay a bit and reset the deepspeech buffer before re-enabling recognition
			setTimeout(function() {
				deepspeech.streamReset();
				speechRecognitionActive = true;
			},200);
		});
	});
	
	bumblebee.on('hotword', function(hotword) {
		if (speechRecognitionActive) {
			stopRecognition();
		}
		else if (!speechRecognitionActive) {
			startRecognition();
		}
		deepspeech.streamReset(); // reset to ignore speech recognition of the hotword that was spoken
	});
	
	bumblebee.on('data', function(data) {
		if (speechRecognitionActive) {
			deepspeech.streamData(data);
		}
	});
	
	bumblebee.start();
	
	console.log('\nStart speech recognition by saying:', Object.keys(bumblebee.hotwords));
});

function stopRecognition() {
	console.log('\nStart speech recognition by saying:', Object.keys(bumblebee.hotwords));
	
	console.log('Speech recognition disabled');
	speechRecognitionActive = false;
	
	voice.say("speech recognition disabled");
}

function startRecognition() {
	console.log('Stop speech recognition by saying:', Object.keys(bumblebee.hotwords));
	
	console.log('Speech recognition enabled');
	voice.say("speech recognition enabled").then(() => {
		speechRecognitionActive = true;
	});
}
