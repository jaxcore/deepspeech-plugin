const DeepSpeech = require('deepspeech');
const VAD = require('node-vad');

let SILENCE_THRESHOLD = 200; // how many milliseconds of inactivity before processing the audio

// const VAD_MODE = VAD.Mode.NORMAL;
// const VAD_MODE = VAD.Mode.LOW_BITRATE;
// const VAD_MODE = VAD.Mode.AGGRESSIVE;
const VAD_MODE = VAD.Mode.VERY_AGGRESSIVE;
const vad = new VAD(VAD_MODE);

let deepSpeechModel;
let deepSpeechModelName;

let defaultOptions = {
	BEAM_WIDTH: 1024,
	LM_ALPHA: 0.75,
	LM_BETA: 1.85
};

function createModel(name, path, options) {
	options = {
		...defaultOptions,
		...options
	};
	deepSpeechModelName = name;
	
	let modelPath = path + '/output_graph.pbmm';
	let lmPath = path + '/lm.binary';
	let triePath = path + '/trie';
	
	deepSpeechModel = new DeepSpeech.Model(modelPath, options.BEAM_WIDTH);
	deepSpeechModel.enableDecoderWithLM(lmPath, triePath, options.LM_ALPHA, options.LM_BETA);
	
	console.log('created model:', name, options);
	createStream();
}

let modelStream = null;
let recordedChunks = 0;
let silenceStart = null;
let recordedAudioLength = 0;
let endTimeout = null;
let silenceBuffers = [];

function processAudioStream(data, callback) {
	
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
	// timeout after 600ms of inactivity
	endTimeout = setTimeout(function() {
		console.log('[timeout]');
		resetAudioStream();
	},SILENCE_THRESHOLD*3);
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
	// VAD has a tendency to cut the first few milliseconds of audio from the start of a recording
	// so keep a buffer of the first 3 chunks of audio data and in addBufferedSilence() reattach it to the beginning of the recording
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
			text = text.trim();
			if (text === 'i' || text === 'a') {
				// bug in DeepSpeech 0.6 causes silence to be inferred as "i" or "a"
				return;
			}
			console.log('');
			console.log('Recognized Text:', text);
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

const { parentPort } = require('worker_threads');
parentPort.on('message', function(msg) {
	if (typeof msg === 'string') {
		if (msg === 'recording-begin') {
			console.log('begin recording');
		}
		else if (msg === 'recording-end') {
			console.log('end recording');
		}
		else if (msg === 'stream-reset') {
			resetAudioStream();
		}
		else if (msg === 'stream-end') {
			endAudioStream((results) => {
				console.log('results', results);
			});
		}
	}
	else if ('model' in msg) {
		createModel(msg.model.name, msg.model.path, msg.model.options || {});
		parentPort.postMessage('worker-ready');
	}
	else if ('data' in msg) {
		let audio = Buffer.from(msg.data);
		processAudioStream(audio, (results) => {
			parentPort.postMessage({
				recognize: {
					text: results.text,
					stats: {
						recogTime: results.recogTime,
						audioLength: results.audioLength,
						model: deepSpeechModelName
					}
				}
			});
		});
	}
});
