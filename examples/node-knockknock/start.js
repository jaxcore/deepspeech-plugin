// load hotword detection
const BumbleBee = require('bumblebee-hotword-node');
const bumblebee = new BumbleBee();
bumblebee.addHotword('bumblebee');

// load speech synthesis
const Say = require('jaxcore-say-node');
Say.speaker = require('speaker');
const voice = new Say({language: 'en-us', profile: 'Jack'});

// load speech recognition
const DeepSpeech = require('jaxcore-deepspeech-plugin');
const MODEL_PATH = process.env.DEEPSPEECH_MODEL || __dirname + '/../../deepspeech-0.6.0-models';
DeepSpeech.start({
	modelName: 'english',
	modelPath: MODEL_PATH,      // path to deepspeech model
	silenceThreshold: 200,      // how many milliseconds of silence before processing the audio
	vadMode: 'VERY_AGGRESSIVE', // options are: 'NORMAL', 'LOW_BITRATE', 'AGGRESSIVE', 'VERY_AGGRESSIVE'
	debug: 'false'               // show recording state
})
.then(startKnockKnock)
.catch(e => {
	console.error(e);
});

// load data file of knock, knock jokes
const jokes = require('fs').readFileSync('./jokes.txt', 'utf-8').split(/\n\n/).map(line => {
	return line.split(/\n/);
});
let jokeIndex = null;
let lineIndex = null;
let errorCount = 0;
let speechRecognitionActive = false;
let speechSynthesisActive = false;
let deepspeech = null;

function startKnockKnock(deepspeechService) {
	deepspeech = deepspeechService;
	
	deepspeech.on('recording', function (recordingState) {
		switch (recordingState) {
			case DeepSpeech.recordingStates.ON:
				process.stdout.write('\n');
				process.stdout.write('[ON]');
				break;
			case DeepSpeech.recordingStates.OFF:
				process.stdout.write('[OFF]');
				process.stdout.write('\n');
				break;
		}
	});
	
	deepspeech.on('vad', function (vadState) {
		switch (vadState) {
			case DeepSpeech.vadStates.SILENCE:
				process.stdout.write('.');
				break;
			case DeepSpeech.vadStates.VOICE:
				process.stdout.write('=');
				break;
			case DeepSpeech.vadStates.IDLE:
				process.stdout.write('-');
				break;
		}
	});
	
	deepspeech.on('recognize', onRecognize);
	
	bumblebee.on('hotword', onHotword);
	
	bumblebee.on('data', function (data) {
		if (speechRecognitionActive && !speechSynthesisActive) {
			deepspeech.streamData(data);
		}
	});
	
	bumblebee.start();
	
	startRecognition().then(() => {
		// 	// nextJoke();
	});
}

function onHotword(hotword) {
	console.log('HOTWORD DETECTED');
	if (speechRecognitionActive) {
		stopRecognition();
	}
	else if (!speechRecognitionActive) {
		startRecognition();
	}
	deepspeech.streamReset(); // reset to ignore speech recognition of the hotword that was spoken
}

// deepspeech usually doesn't quite get these words right, so let's correct them using substitution
const corrections = {
	'banana': 'the nana who|the nana|by nana|but nana|but nanna',
	'who\'s there': 'whose there|who is there|is there|who are',
	'dishes who': 'dish is who|tish is who'
};


function onRecognize(text, stats) {
	// if (!text) {
	// 	console.log('recognize', text);
	// 	process.exit();
	// 	return;
	// }
	
	if (jokeIndex === null) {
		console.log('Speech recognition result:', text);
		// main menu
		if (/yes|okay|sure/.test(text)) {
			nextJoke();
		}
		else if (/no|nope|quit|exit/.test(text)) {
			console.log('GOT NOPE');
			sleep();
		}
		else {
			errorCount++;
			if (errorCount > 1) {
				say("yes or no will do").then(intro);
				errorCount = 0;
			}
		}
		return;
	}
	
	// make corrections using sstring substitutions
	for (let key in corrections) {
		// console.log('correct', key);
		text = text.replace(new RegExp(corrections[key], 'i'), key)
	}
	
	let expectedResponse = jokes[jokeIndex][lineIndex + 1];
	expectedResponse = expectedResponse.toLowerCase().replace(/\?|\!/, '')
	
	console.log('Expected Response:', expectedResponse);
	console.log('Actual Response:', text);
	
	if (text === expectedResponse) {
		nextLine();
	}
	else {
		errorCount++;
		let response;
		let repeatLine = false;
		switch (errorCount) {
			case 1:
				return;
			case 2:
				response = "no";
				break;
			case 3:
				response = "try again";
				repeatLine = true;
				break;
			case 4:
				response = "no, you're supposed to say. " + expectedResponse;
				errorCount = 0;
				break;
		}
		
		say(response).then(() => {
			if (repeatLine) {
				sayLine()
			}
		})
	}
}

function nextJoke() {
	jokeIndex++;
	lineIndex = null;
	nextLine();
}

function nextLine() {
	errorCount = 0;
	if (lineIndex === null) lineIndex = 0;
	else lineIndex += 2;
	sayLine();
	
	if (lineIndex >= jokes[jokeIndex].length) {
		console.log('JOKE DONE');
	}
}

function sayLine() {
	let line = jokes[jokeIndex][lineIndex];
	say(line);
}

function say(text) {
	console.log('say', text);
	return new Promise((resolve) => {
		speechSynthesisActive = true;  // disable recognition while using text-to-speech
		console.log('\nCOMPUTER Says:', text);
		voice.say(text).then(() => {
			// delay a bit and reset the deepspeech buffer before re-enabling recognition
			setTimeout(function () {
				deepspeech.streamReset();
				speechSynthesisActive = false;
				resolve();
			}, 200);
		});
	});
}

function sleep() {
	jokeIndex = null;
	lineIndex = null;
	stopRecognition();
}

function stopRecognition() {
	console.log('stopRecognition');
	console.log('\nStart speech recognition by saying:', Object.keys(bumblebee.hotwords));
	console.log('Speech recognition disabled');
	speechRecognitionActive = false;
	return say("Alright. To wake me up just say the magic word... bumble bee");
}

function intro() {
	console.log('intro()');
	return new Promise((resolve, reject) => {
		let another = jokeCount === 0 ? 'a' : 'another';
		console.log('yo!')
		// resolve();
		return say("Would you like to hear "+another+" knock knock joke?").then(() => {
			console.log('Say: YES or NO');
			resolve();
		});
	});
}

function startRecognition() {
	console.log(' x Stop speech recognition by saying:', Object.keys(bumblebee.hotwords));
	return new Promise((resolve, reject) => {
		speechRecognitionActive = false;
		console.log('??');
		return intro().then(() => {
			console.log('then??');
			speechRecognitionActive = true;
			resolve();
		});
	});
}
