const AudioRecorder = require(`node-audiorecorder`);
const DeepSpeech = require('deepspeech');
const VAD = require('node-vad');

let MODEL_NAME = process.argv[2];
let DEEPSPEECH_MODEL = process.argv[3];
console.log('DEEPSPEECH_MODEL', MODEL_NAME, DEEPSPEECH_MODEL);

let SILENCE_THRESHOLD = 200; // how many milliseconds of inactivity before processing the audio
if (process.argv[4] > 0) {
	SILENCE_THRESHOLD = process.argv[4];
	console.log('SILENCE_THRESHOLD:', SILENCE_THRESHOLD);
}

// const VAD_MODE = VAD.Mode.NORMAL;
// const VAD_MODE = VAD.Mode.LOW_BITRATE;
// const VAD_MODE = VAD.Mode.AGGRESSIVE;
let VAD_MODE = VAD.Mode.VERY_AGGRESSIVE;
if (process.argv[5] && process.argv[5] in VAD.Mode) {
	VAD_MODE = VAD.Mode[process.argv[5]];
	console.log('VAD_MODE:', VAD_MODE);
}

const vad = new VAD(VAD_MODE);

function createModel(modelDir, options) {
	let modelPath = modelDir + '/output_graph.pbmm';
	let lmPath = modelDir + '/lm.binary';
	let triePath = modelDir + '/trie';
	let model = new DeepSpeech.Model(modelPath, options.BEAM_WIDTH);
	model.enableDecoderWithLM(lmPath, triePath, options.LM_ALPHA, options.LM_BETA);
	return model;
}

let deepSpeechModel = createModel(DEEPSPEECH_MODEL, {
	BEAM_WIDTH: 1024,
	LM_ALPHA: 0.75,
	LM_BETA: 1.85
});

let modelStream = null;
let recordedChunks = 0;
let silenceStart = null;
let recordedAudioLength = 0;
let endTimeout = null;
let silenceBuffers = [];

function processAudioStream(data, callback) {
	// if (!modelStream) createStream();
	// timeout after 1s of inactivity
	vad.processAudio(data, 16000).then((res) => {
		switch (res) {
			case VAD.Event.ERROR:
				console.log("VAD ERROR");
				break;
			case VAD.Event.NOISE:
				console.log("VAD NOISE");
				break;
			case VAD.Event.SILENCE:
				processSilence(data, callback);
				break;
			case VAD.Event.VOICE:
				processVoice(data);
				break;
		}
	});
	clearTimeout(endTimeout);
	endTimeout = setTimeout(function() {
		console.log('timeout');
		resetAudioStream();
	},1000);
}

function endAudioStream(callback) {
	clearTimeout(endTimeout);
	let results = intermediateDecode();
	if (results) {
		if (callback) {
			callback(results);
		}
	}
}

function resetAudioStream() {
	clearTimeout(endTimeout);
	console.log('[reset]');
	intermediateDecode(); // ignore results
	recordedChunks = 0;
	silenceStart = null;
}

function processSilence(data, callback) {
	if (recordedChunks > 0) { // recording is on
		process.stdout.write('-'); // silence detected while recording
		
		if (data) feedAudioContent(data);
		
		if (silenceStart === null) {
			silenceStart = new Date().getTime();
		}
		else {
			let now = new Date().getTime();
			if (now - silenceStart > SILENCE_THRESHOLD) {
				silenceStart = null;
				console.log('[end]');
				let results = intermediateDecode();
				if (results) {
					if (callback) {
						callback(results);
					}
				}
			}
		}
	}
	else {
		process.stdout.write('.'); // silence detected while not recording
		if (data) bufferSilence(data);
	}
}

function bufferSilence(data) {
	// VAD has a tendency to cut the first bit of audio data from the start of a recording
	// so keep a buffer of that first bit of audio and in addBufferedSilence() reattach it to the beginning of the recording
	silenceBuffers.push(data);
	if (silenceBuffers.length >= 3) {
		silenceBuffers.shift();
	}
}

function addBufferedSilence(data) {
	let audioBuffer;
	if (silenceBuffers.length) {
		silenceBuffers.push(data);
		let length = 0;
		silenceBuffers.forEach(function (buf) {
			length += buf.length;
		});
		audioBuffer = Buffer.concat(silenceBuffers, length);
		silenceBuffers = [];
	}
	else audioBuffer = data;
	return audioBuffer;
}

function processVoice(data) {
	silenceStart = null;
	if (recordedChunks === 0) {
		console.log('');
		process.stdout.write('[start]'); // recording started
	}
	else {
		process.stdout.write('='); // still recording
	}
	recordedChunks++;
	
	data = addBufferedSilence(data);
	feedAudioContent(data);
}

function createStream() {
	if (modelStream) {
		console.error('modelStream exists');
		process.exit();
		return;
	}
	modelStream = deepSpeechModel.createStream();
	recordedChunks = 0;
	recordedAudioLength = 0;
}

function finishStream() {
	if (modelStream) {
		let start = new Date();
		let text = deepSpeechModel.finishStream(modelStream);
		if (text) {
			if (text === 'i' || text === 'a' || text === 't') {
				// bug in DeepSpeech 0.6 causes silence to be inferred as "i" or "a", and any end of a stream is inferred as "t"
				return;
			}
			// console.log('');
			// console.log('Recognized Text:', text);
			let recogTime = new Date().getTime() - start.getTime();
			return {
				text,
				recogTime,
				audioLength: Math.round(recordedAudioLength)
			};
		}
	}
	silenceBuffers = [];
	modelStream = null;
}

function intermediateDecode() {
	let results = finishStream();
	if (modelStream) {
		modelStream = null;
		if (modelStream) {
			console.log('what');
			process.exit();
		}
	}
	createStream();
	return results;
}

function feedAudioContent(chunk) {
	recordedAudioLength += (chunk.length / 2) * (1 / 16000) * 1000;
	deepSpeechModel.feedAudioContent(modelStream, chunk.slice(0, chunk.length / 2));
}

let recorder;
function startMicrophone() {
	if (recorder) {
		console.log('recorder exists');
		return;
	}
	
	recorder = new AudioRecorder({
		program: process.platform === 'win32' ? 'sox' : 'rec',
		silence: 0
	});
	
	recorder.start();
	
	let stream = recorder.stream();
	stream.on(`error`, () => {
		console.log('Recording error.');
		deepSpeechModel.streamReset();
	});
	
	stream.on('data', function(data) {
		processAudioStream(data, (results) => {
			sendResults(results)
		});
	});
	
	stream.on('end', function(data) {
		deepSpeechModel.streamReset();
	});
}

function stopMicrophone() {
	recorder.stop();
}

createStream();

function sendResults(results) {
	process.send({
		recognize: {
			text: results.text,
			stats: {
				recogTime: results.recogTime,
				audioLength: results.audioLength,
				model: MODEL_NAME
			}
		}
	});
}

process.on('message', function (data) {
	if (typeof data === 'string') {
		let msg = data;
		
		if (msg === 'microphone-start') {
			startMicrophone();
		}
		else if (msg === 'microphone-stop') {
			stopMicrophone();
		}
		else if (msg === 'stream-reset') {
			resetAudioStream();
		}
		else if (msg === 'stream-end') {
			endAudioStream((results) => {
				sendResults(results);
			});
		}
	}
	else if (data.data.length > 1) {
		let audio = Buffer.from(data);
		processAudioStream(audio, (results) => {
			sendResults(results)
		});
	}
});

try {
	console.log('deepspeech-process ready...');
	process.send({
		ready: true
	});
}
catch(e) {
	console.log('error', e);
	process.exit();
}
