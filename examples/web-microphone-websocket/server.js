const http = require('http');
const socketIO = require('socket.io');
const MemoryStream = require('memory-stream');
const DeepSpeech = require('deepspeech');
const VAD = require('node-vad');

const VAD_MODE = VAD.Mode.NORMAL;
// const VAD_MODE = VAD.Mode.LOW_BITRATE;
// const VAD_MODE = VAD.Mode.AGGRESSIVE;
// const VAD_MODE = VAD.Mode.VERY_AGGRESSIVE;

const vad = new VAD(VAD_MODE);

function createModel(modelDir, options) {
	let modelPath = modelDir + '/output_graph.pbmm';
	let lmPath = modelDir + '/lm.binary';
	let triePath = modelDir + '/trie';
	let model = new DeepSpeech.Model(modelPath, options.BEAM_WIDTH);
	model.enableDecoderWithLM(lmPath, triePath, options.LM_ALPHA, options.LM_BETA);
	return model;
}

let englishModelPath = __dirname + '/../../deepspeech-0.6.0-models';

const deepSpeechOptions = {
	BEAM_WIDTH: 1024,
	N_FEATURES: 26,
	N_CONTEXT: 9,
	LM_ALPHA: 0.75,
	LM_BETA: 1.85
};

let englishModel = createModel(englishModelPath, deepSpeechOptions);

let modelStream;
let recordedChunks = 0;
let silenceStart = null;
let recordedAudioLength = 0;

let SILENCE_THRESHOLD = 100; // how many milliseconds of inactivity before processing the audio

function recognizeMomentary(stream) {
	let audioBuffer = stream.toBuffer();
	const audioLength = (audioBuffer.length / 2) * (1 / 16000) * 1000;
	
	console.log('recognizing...');
	let start = new Date().getTime();
	let text = englishModel.stt(audioBuffer.slice(0, audioBuffer.length / 2));
	let end = new Date().getTime();
	let recogTime = end - start;
	
	console.log('recognized:', text);
	console.log('audio length:', (Math.round(audioLength/100)/10)+'s');
	console.log('recognition time:', (Math.round(recogTime/100)/10)+'s');
	
	return {
		text,
		audioLength,
		recogTime
	};
}

function processSilence(data, callback) {
	if (recordedChunks > 0) { // recording is on
		feedAudioContent(data);
		
		if (silenceStart === null) {
			process.stdout.write('-'); // silence first detected while recording
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
			else {
				process.stdout.write('-'); // silence detected while recording
			}
		}
	}
	else {
		process.stdout.write('.'); // silence detected while not recording
	}
}

function endContinuous(callback) {
	let results = intermediateDecode();
	if (results) {
		if (callback) {
			callback(results);
		}
	}
	recordedChunks = 0;
	silenceStart = null;
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
	feedAudioContent(data);
}

function processContinous(res, data, callback) {
	// console.log('c', data.speech.start, data.speech.state, data.speech.end);
	
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
}

function createStream() {
	modelStream = englishModel.createStream();
	recordedChunks = 0;
	recordedAudioLength = 0;
}

function finishStream() {
	let start = new Date();
	let text = englishModel.finishStream(modelStream);
	if (text) {
		if (text === 'i') {
			// bug in DeepSpeech 0.6 causes silence to be inferred as "i"
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

function intermediateDecode() {
	let results = finishStream();
	createStream();
	return results;
}

function feedAudioContent(chunk) {
	recordedAudioLength += (chunk.length / 2) * ( 1 / 16000) * 1000;
	englishModel.feedAudioContent(modelStream, chunk.slice(0, chunk.length / 2));
}

const app = http.createServer(function (req, res) {
	res.writeHead(200);
	res.write('web-microphone-websocket');
	res.end();
});

const io = socketIO(app, {});

io.on('connection', function(socket) {
	console.log('client connected');
	
	socket.once('disconnect', () => {
		console.log('socket disconnected');
	});
	
	socket.on('client-ready', function(data) {
		console.log('client-ready', data);
	});
	
	let momentaryStream;
	
	socket.on('momentary-begin', function(data) {
		console.log('momentary-begin', data.length);
		momentaryStream = new MemoryStream();
		momentaryStream.write(data);
	});
	socket.on('momentary-data', function(data) {
		console.log('momentary-data', data.length);
		momentaryStream.write(data);
	});
	socket.on('momentary-end', function() {
		console.log('momentary-end');
		momentaryStream.end();
		let results = recognizeMomentary(momentaryStream);
		socket.emit('recognize', results);
	});
	
	createStream();
	
	socket.on('continuous-begin', function(data) {
		vad.processAudio(data, 16000).then((res) => {
			processContinous(res, data);
		});
	});
	socket.on('continuous-data', function(data) {
		vad.processAudio(data, 16000).then((res) => {
			processContinous(res, data, (results) => {
				socket.emit('recognize', results);
			});
		});
	});
	socket.on('continuous-end', function() {
		console.log('continuous-end');
		endContinuous((results) => {
			socket.emit('recognize', results);
		});
	});
	
	socket.emit('server-ready');
});

app.listen(4000, 'localhost', () => {
	console.log('Socket server listening on : ' + 4000);
});

