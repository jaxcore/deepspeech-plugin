const http = require('http');
const socketIO = require('socket.io');
const MemoryStream = require('memory-stream');
const DeepSpeech = require('deepspeech');

const deepSpeechDefaults = {
	BEAM_WIDTH: 1024,
	N_FEATURES: 26,
	N_CONTEXT: 9,
	LM_ALPHA: 0.75,
	LM_BETA: 1.85
};

function createModel(modelDir, options) {
	let modelPath = modelDir + '/output_graph.pbmm';
	let lmPath = modelDir + '/lm.binary';
	let triePath = modelDir + '/trie';
	let settings = Object.assign({}, deepSpeechDefaults, options);
	let model = new DeepSpeech.Model(modelPath, settings.BEAM_WIDTH);
	model.enableDecoderWithLM(lmPath, triePath, settings.LM_ALPHA, settings.LM_BETA);
	return model;
}

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

let englishModelPath = __dirname + '/../../deepspeech-0.6.0-models';

let englishModel = createModel(englishModelPath);

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
	
	socket.emit('server-ready');
});

app.listen(4000, 'localhost', () => {
	console.log('Socket server listening on : ' + 4000);
});

