// load hotword detection
const BumbleBee = require('bumblebee-hotword-node');
const bumblebee = new BumbleBee();
bumblebee.addHotword('bumblebee');
bumblebee.setHotword('bumblebee');

// load speech synthesis
const Say = require('jaxcore-say-node');
Say.speaker = require('speaker');
const voice = new Say({language: 'en-us', profile: 'Jack'});

const jokeLogic = require('./lib/knockknock-logic.js');

// load speech recognition
const DeepSpeech = require('jaxcore-deepspeech-plugin');

DeepSpeech.start({
	modelName: 'english',
	modelPath: process.env.DEEPSPEECH_MODEL || __dirname + '/../../deepspeech-0.7.0-models', // path to deepspeech model,
	silenceThreshold: 200,      // how many milliseconds of silence before processing the audio
	vadMode: 'VERY_AGGRESSIVE', // options are: 'NORMAL', 'LOW_BITRATE', 'AGGRESSIVE', 'VERY_AGGRESSIVE'
	debug: 'true'               // show recording status
})
.then(start)
.catch(e => {
	console.error(e);
});

let speechRecognitionActive = false;
let speechSynthesisActive = false;
let deepspeech = null;

function start(deepspeechService) {
	deepspeech = deepspeechService;
	
	jokeLogic.init({
		say,
		stopRecognition
	});
	
	deepspeech.on('recognize', (text, stats) => {
		jokeLogic.processSpeech(text, stats);
	});
	
	bumblebee.on('hotword', onHotword);
	
	bumblebee.on('data', function (data) {
		if (speechRecognitionActive && !speechSynthesisActive) {
			deepspeech.streamData(data);
		}
		else {
			process.stdout.write('_');
		}
	});
	
	bumblebee.on('muted', function () {
		process.stdout.write('~');
	});
	
	bumblebee.on('connect', function() {
		// enable both bumblebee and deepspeech on startup
		bumblebee.start();
		speechRecognitionActive = true;
		// say the first joke
		jokeLogic.begin();
	});
	bumblebee.connect();
}

function onHotword(hotword) {
	console.log('\nHotword Detected: ['+hotword+']');
	if (speechRecognitionActive) {
		stopRecognition();
	}
	else if (!speechRecognitionActive) {
		startRecognition();
	}
	deepspeech.streamReset(); // reset to ignore speech recognition of the hotword that was spoken
}

function say(text) {
	return new Promise((resolve) => {
		console.log('\nCOMPUTER Says:', text);
		speechSynthesisActive = true;  // disable deepspeech while using text-to-speech
		bumblebee.setMuted(true);  // disable bumblebee while using text-to-speech
		voice.say(text).then(() => {
			// delay a bit and reset the deepspeech buffer before re-enabling recognition
			setTimeout(function () {
				bumblebee.setMuted(false);
				deepspeech.streamReset();
				speechSynthesisActive = false;
				resolve();
			}, 200);
		});
	});
}

function stopRecognition() {
	speechRecognitionActive = false;
	return say("Alright.").then(() => {
		say("To wake me up just say the magic word... bumble bee");
	});
}

function startRecognition() {
	return new Promise((resolve, reject) => {
		speechRecognitionActive = false;
		jokeLogic.intro().then(() => {
			speechRecognitionActive = true;
			resolve();
		});
	});
}
