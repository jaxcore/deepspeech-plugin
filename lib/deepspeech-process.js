const DeepSpeech = require('deepspeech');

const MODEL_NAME = process.argv[2];
const DEEPSPEECH_MODEL = process.argv[3];
const DEBUG = (process.argv[6] === 'true');

println('DEEPSPEECH_MODEL', {
	name: MODEL_NAME,
	path: DEEPSPEECH_MODEL
});

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
let recordedAudioLength = 0;

function println() {
	if (DEBUG) console.log.apply(null, Array.from(arguments));
}
function print(s) {
	if (DEBUG) process.stdout.write(s);
}

function endAudioStream(callback) {
	let results = intermediateDecode();
	if (results) {
		if (callback) {
			callback(results);
		}
	}
	else {
		callback();
	}
}

function resetAudioStream() {
	intermediateDecode(); // ignore results
}

function createStream() {
	if (modelStream) {
		console.error('modelStream exists');
		process.exit();
		return;
	}
	modelStream = deepSpeechModel.createStream();
	recordedAudioLength = 0;
}

function finishStream() {
	if (modelStream) {
		let start = new Date();
		let text = deepSpeechModel.finishStream(modelStream);
		if (text) {
			text = text.trim();
			// if (text === 'i' || text === 'a' || text === 't') {
			// 	// bug in DeepSpeech 0.6 causes silence to be inferred as "i" or "a", and any end of a stream is inferred as "t"
			// 	return;
			// }
			if (DEBUG) {
				println('');
				println('Recognized Text:', '"'+text+'"');
			}
			let recogTime = new Date().getTime() - start.getTime();
			return {
				text,
				recogTime,
				audioLength: Math.round(recordedAudioLength)
			};
		}
	}
	modelStream = null;
}

function intermediateDecode() {
	let results = finishStream();
	if (modelStream) {
		modelStream = null;
	}
	createStream();
	return results;
}

function feedAudioContent(chunk) {
	recordedAudioLength += (chunk.length / 2) * (1 / 16000) * 1000;
	deepSpeechModel.feedAudioContent(modelStream, chunk.slice(0, chunk.length / 2));
}
createStream();

function sendResults(results) {
	if (results) {
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
	else {
		process.send({
			noRecognition: true
		});
	}
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
	else if (data.data && data.data.length > 1) {
		let audio = Buffer.from(data);
		feedAudioContent(audio);
	}
});

println('deepspeech-process ready...');
process.send({
	ready: true
});
