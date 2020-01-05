const DeepSpeech = require('deepspeech');
const VAD = require('node-vad');
const {recordingStates, vadStates} = require('./constants');

const MODEL_NAME = process.argv[2];
const DEEPSPEECH_MODEL = process.argv[3];
let SILENCE_THRESHOLD = process.argv[4]? parseInt(process.argv[4]) : 200; // how many milliseconds of inactivity before processing the audio

// const VAD_MODE = VAD.Mode.NORMAL;
// const VAD_MODE = VAD.Mode.LOW_BITRATE;
// const VAD_MODE = VAD.Mode.AGGRESSIVE;
let VAD_MODE = VAD.Mode.VERY_AGGRESSIVE;

if (process.argv[5] && process.argv[5] in VAD.Mode) {
	VAD_MODE = VAD.Mode[process.argv[5]];
}

const DEBUG = (process.argv[6] === 'true');

println('DEEPSPEECH_MODEL', {
	name: MODEL_NAME,
	path: DEEPSPEECH_MODEL,
	vad: VAD_MODE,
	silence: SILENCE_THRESHOLD
});

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

function println() {
	if (DEBUG) console.log.apply(null, Array.from(arguments));
}
function print(s) {
	if (DEBUG) process.stdout.write(s);
}

function processAudioStream(data, callback) {
	// if (!modelStream) createStream();
	// timeout after 1s of inactivity
	vad.processAudio(data, 16000).then((res) => {
		switch (res) {
			case VAD.Event.ERROR:
				println("VAD ERROR");
				break;
			case VAD.Event.NOISE:
				println("VAD NOISE");
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
		println('[timeout]');
		sendRecordingState(recordingStates.OFF);
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
	println('[reset]');
	sendRecordingState(recordingStates.OFF);
	intermediateDecode(); // ignore results
	recordedChunks = 0;
	silenceStart = null;
}

function processSilence(data, callback) {
	if (recordedChunks > 0) { // recording is on
		print('-'); // silence detected while recording
		sendVADState(vadStates.IDLE);
		
		if (data) feedAudioContent(data);
		
		if (silenceStart === null) {
			silenceStart = new Date().getTime();
		}
		else {
			let now = new Date().getTime();
			if (now - silenceStart > SILENCE_THRESHOLD) {
				silenceStart = null;
				println('[end]');
				sendRecordingState(recordingStates.OFF);
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
		print('.'); // silence detected while not recording
		sendVADState(vadStates.SILENCE);
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
		println('');
		print('[start]'); // recording started
		sendRecordingState(recordingStates.ON);
	}
	else {
		print('='); // still recording
		sendVADState(vadStates.VOICE);
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
			// println('');
			// println('Recognized Text:', text);
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
			println('what');
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

function sendRecordingState(state) {
	process.send({
		recording: state
	});
}
function sendVADState(state) {
	process.send({
		vad: state
	});
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
		
		if (msg === 'stream-reset') {
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

// try {
	println('deepspeech-process ready...');
	process.send({
		ready: true
	});
// }
// catch(e) {
// 	println('error', e);
// 	process.exit();
// }
