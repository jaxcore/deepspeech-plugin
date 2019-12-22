const http = require('http');
const socketIO = require('socket.io');
const MemoryStream = require('memory-stream');
const DeepSpeech = require('deepspeech');
const VAD = require('node-vad');

// const VAD_MODE = VAD.Mode.NORMAL;
// const VAD_MODE = VAD.Mode.LOW_BITRATE;
const VAD_MODE = VAD.Mode.AGGRESSIVE;
// const VAD_MODE = VAD.Mode.VERY_AGGRESSIVE;

const vad = new VAD(VAD_MODE); //LOW_BITRATE NORMAL AGGRESSIVE VERY_AGGRESSIVE

// Time in milliseconds for debouncing speech active state

// Create voice activity stream
// const VAD_STREAM = VAD.createStream({
// 	mode: VAD_MODE,
// 	audioFrequency: 16000,
// 	debounceTime: 1100
// });


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

let silenceStart = null;

let SILENCE_THRESHOLD = 200;

function processSilence(data, callback) {
	if (continuousFeed > 0) {
		feedAudioContent(data);
		
		if (!silenceStart) {
			console.log('.?');
			silenceStart = new Date().getTime();
		}
		else {
			let now = new Date().getTime();
			if (now - silenceStart > SILENCE_THRESHOLD) {
				console.log('1s of silence');
				let results = intermediateDecode();
				
				if (results) {
					if (callback) {
						console.log('callback results');
						callback(results);
					}
					else {
						console.log('no cb');
						process.exit();
					}
				}
				else {
					console.log('no results');
					process.exit();
				}
				silenceStart = null;
			}
		}
	}
	else {
		process.stdout.write('.');
	}
}

function processVoice(data) {
	silenceStart = null;
	
	if (continuousFeed === 0) {
		console.log('');
		console.log('.start');
	}
	else {
		console.log('.r');
	}
	continuousFeed++;
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

let modelStream;
let continuousFeed;

function createStream() {
	modelStream = englishModel.createStream();
	continuousFeed = 0;
}

function finishStream() {
	// const model_load_start = process.hrtime();
	// console.error('Running inference.');
	let start = new Date();
	let text = englishModel.finishStream(modelStream);
	let recogTime = new Date().getTime() - start.getTime();
	console.log('Continuous Recognized:', text);
	
	// const model_load_end = process.hrtime(model_load_start);
	// console.error('Inference took %ds for %ds audio file.', totalTime(model_load_end), audioLength.toPrecision(4));
	// audioLength = 0;
	console.log('returning........');
	return {
		text,
		recogTime
	};
}

function intermediateDecode() {
	let results = finishStream();
	createStream();
	return results;
}

function feedAudioContent(chunk) {
	// audioLength += (chunk.length / 2) * ( 1 / AUDIO_SAMPLE_RATE);
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
	
	
	// let continuousStream;
	
	// continuousFeed = 0;
	
	createStream();
	
	// function processVad(data) {
	// 	if (data.speech.start||data.speech.state) feedAudioContent(data.audioData)
	// 	else if (data.speech.end) { feedAudioContent(data.audioData); intermediateDecode() }
	// }
	//
	// VAD_STREAM.on('data', function(data) {
	// 	if (data.speech.start) console.log('start');
	// 	if (data.speech.state) console.log('state');
	// 	if (data.speech.end) console.log('end');
	//
	// 	// console.log('vadstream', data);
	// 	// if (data.speech.start || data.speech.state) feedAudioContent(data.audioData);
	// 	// else if (data.speech.end) { feedAudioContent(data.audioData); intermediateDecode() }
	// });
	
	// ffmpeg.stdout.pipe(VAD_STREAM).on('data', processVad);
	
	socket.on('continuous-begin', function(data) {
		// console.log('continuous-begin', data.length);
		
		// VAD_STREAM.write(data);
		
		vad.processAudio(data, 16000).then((res) => {
			processContinous(res, data);
		});
		
		// continuousStream = new MemoryStream();
		// momentaryStream.write(data);
	});
	socket.on('continuous-data', function(data) {
		// console.log('continuous-data', data.length);
		// momentaryStream.write(data);
		
		// VAD_STREAM.write(data);
		
		vad.processAudio(data, 16000).then((res) => {
			processContinous(res, data, (results) => {
				if (results.text !== 'i') {
					socket.emit('recognize', results);
				}
			});
		});
	});
	socket.on('continuous-end', function() {
		console.log('continuous-end');
		// momentaryStream.end();
		// let results = recognizeMomentary(momentaryStream);
		// socket.emit('recognize', results);
	});
	
	socket.emit('server-ready');
});

app.listen(4000, 'localhost', () => {
	console.log('Socket server listening on : ' + 4000);
});

