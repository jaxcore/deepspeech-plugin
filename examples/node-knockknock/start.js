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
				process.stdout.write('[start]');
				break;
			case DeepSpeech.recordingStates.OFF:
				process.stdout.write('[stop]');
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
			// process.stdout.write('+');
			deepspeech.streamData(data);
		}
		else {
			process.stdout.write('_');
		}
	});
	
	bumblebee.on('muted', function (data) {
		process.stdout.write('~');
	});
	
	bumblebee.on('connect', function() {
		bumblebee.start();
		
		speechRecognitionActive = true;
		nextJoke();
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

// deepspeech usually doesn't quite get these words right, so let's correct them using substitution
const corrections = {
	'banana': 'the nana who|the nana|by nana|but nana|but nanna',
	'who\'s there': 'whose there|who is there|is there|who are|whose hair|who there',
	'dishes who': 'dish is who|tish is who|this is who',
	'who': 'whom',
	'boo': 'bo|boom|booth',
	'boo who': 'but who'
};

function onRecognize(text, stats) {
	if (text === "exit") {
		sleep();
	}
	else if (jokeIndex === null || isJokeDone()) {
		processMainMenuResponse(text);
	}
	else {
		processJokeResponse(text);
	}
}

function processMainMenuResponse(text) {
	console.log('Speech recognition result:', text);
	if (text === 'yes') {
		nextJoke();
	}
	else if (text === 'no') {
		sleep();
	}
	else {
		errorCount++;
		if (errorCount > 1) {
			say("I require a yes or no answer").then(intro);
		}
	}
}

function getLastLine() {
	return jokes[jokeIndex][lineIndex-1];
}
function getExpectedResponse() {
	let expectedResponse;
	if (jokes[jokeIndex]) expectedResponse = jokes[jokeIndex][lineIndex];
	expectedResponse = expectedResponse.toLowerCase().replace(/\?|\!/, '')
	return expectedResponse;
}

function makeCorrections(text, corrections) {
	// make corrections using string substitutions
	for (let key in corrections) {
		let r = '(?<=\s|^)('+corrections[key]+')(?=\s|$)';
		let regex = new RegExp(r, 'i');
		let match = regex.test(text);
		if (match) {
			text = text.replace(new RegExp(r, 'i'), function (m, a) {
				console.log(m);
				return key;
			});
		}
	}
	return text;
}

function processJokeResponse(text) {
	text = makeCorrections(text, corrections);
	
	let lastLine = getLastLine();
	let expectedResponse = getExpectedResponse();
	
	if (text === expectedResponse) {
		console.log('HUMAN Says:', text);
		nextLine();
	}
	else {
		console.log('HUMAN Says:', '"'+text+'"');
		console.log('Expected Response Was:', expectedResponse);
		errorCount++;
		let response;
		let repeatLine = false;
		switch (errorCount) {
			case 1:
				return;
			case 2:
				response = "Try again";
				repeatLine = true;
				break;
			case 3:
				response = "You're supposed to say. " + expectedResponse;
				break;
			case 4:
				response = "You can stop at any time by saying ... exit";
				errorCount = 0;
				repeatLine = true;
				break;
		}
		
		say(response).then(() => {
			if (repeatLine) {
				say(lastLine)
			}
		})
	}
}

let jokeCount = 0;
function nextJoke() {
	jokeCount++;
	if (jokeIndex === null) {
		jokeIndex = 0;
	}
	else jokeIndex++;
	lineIndex = null;
	nextLine();
}

function nextLine() {
	errorCount = 0;
	
	if (isJokeDone()) {
		jokeDone();
	}
	else {
		if (lineIndex === null) {
			lineIndex = 0;
		}
		else {
			lineIndex += 1;
		}
		
		if (isJokeDone()) {
			jokeDone();
			return;
		}
		
		let isComputerLine = (lineIndex % 2 === 0);
		
		if (isComputerLine) {
			sayLine().then(() => {
				nextLine();
			});
		}
	}
}

function isJokeDone() {
	if (!jokes[jokeIndex]) return true;
	return jokeIndex !== null && lineIndex >= (jokes[jokeIndex].length);
}

function jokeDone() {
	say("Ha ha ha... I hope you liked that one").then(intro);
}

function sayLine() {
	let line = jokes[jokeIndex][lineIndex];
	return say(line);
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

function sleep() {
	jokeIndex = null;
	lineIndex = null;
	stopRecognition();
}

function stopRecognition() {
	speechRecognitionActive = false;
	return say("Alright.").then(() => {
		magicWord();
	});
}

function magicWord() {
	return say("To wake me up just say the magic word... bumble bee");
}

function intro() {
	return new Promise((resolve) => {
		if (jokeIndex === jokes.length - 1) {
			console.log('Returning to first joke');
			jokeIndex = null;
			lineIndex = null;
		}
		
		let another = jokeCount === 0 ? 'a' : 'another';
		say("Would you like to hear "+another+" knock knock joke?").then(() => {
			console.log('Say: YES or NO');
			resolve();
		});
	});
}

function startRecognition() {
	return new Promise((resolve, reject) => {
		speechRecognitionActive = false;
		intro().then(() => {
			speechRecognitionActive = true;
			resolve();
		});
	});
}
