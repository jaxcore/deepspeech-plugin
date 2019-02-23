const DeepSpeech = require('deepspeech');
const Fs = require('fs');
const Sox = require('sox-stream');
const MemoryStream = require('memory-stream');
const Duplex = require('stream').Duplex;
const Wav = require('node-wav');

const BEAM_WIDTH = 1024;
const N_FEATURES = 26;
const N_CONTEXT = 9;
let modelPath = '../voice/models/output_graph.pbmm';
let alphabetPath = '../voice/models/alphabet.txt';

let model = new DeepSpeech.Model(modelPath, N_FEATURES, N_CONTEXT, alphabetPath, BEAM_WIDTH);

// TODO: use language file options?
// const LM_ALPHA = 0.75;
// const LM_BETA = 1.85;
// let lmPath = '';
// let triePath = '';
// model.enableDecoderWithLM(alphabetPath, lmPath, triePath, LM_ALPHA, LM_BETA);


const buffer = Fs.readFileSync('./audio.wav');
const result = Wav.decode(buffer);

if (result.sampleRate < 16000) {
	console.error('Warning: original sample rate (' + result.sampleRate + ') is lower than 16kHz. Up-sampling might produce erratic speech recognition.');
}

function bufferToStream(buffer) {
	var stream = new Duplex();
	stream.push(buffer);
	stream.push(null);
	return stream;
}

var audioStream = new MemoryStream();
bufferToStream(buffer).
pipe(Sox({
	global: {
		'no-dither': true,
	},
	output: {
		bits: 16,
		rate: 16000,
		channels: 1,
		encoding: 'signed-integer',
		endian: 'little',
		compression: 0.0,
		type: 'raw'
	}
})).
pipe(audioStream);

audioStream.on('finish', () => {
	
	var audioBuffer = audioStream.toBuffer();
	
	const audioLength = (audioBuffer.length / 2) * ( 1 / 16000);
	console.log('audio length', audioLength);
	
	let result = model.stt(audioBuffer.slice(0, audioBuffer.length / 2), 16000);
	
	console.log('result:', result);
});