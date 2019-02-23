const DeepSpeech = require('deepspeech');
const Fs = require('fs');
// const Sox = require('sox-stream');
const MemoryStream = require('memory-stream');
// const Duplex = require('stream').Duplex;
// const Wav = require('node-wav');

const BEAM_WIDTH = 1024;
const N_FEATURES = 26;
const N_CONTEXT = 9;

let modelPath = __dirname+'/../models/output_graph.pbmm';
let alphabetPath = __dirname+'/../models/alphabet.txt';

if (!Fs.existsSync(modelPath)){
	console.log('Model does not exist:', modelPath);
	process.exit();
}

if (!Fs.existsSync(alphabetPath)){
	console.log('Alphabet does not exist:', alphabetPath);
	process.exit();
}

let model = new DeepSpeech.Model(modelPath, N_FEATURES, N_CONTEXT, alphabetPath, BEAM_WIDTH);


const fs = require(`fs`);
const path = require(`path`);
const AudioRecorder = require(`node-audiorecorder`);

// const DIRECTORY = __dirname+'/../recordings/';
//
// const audioRecorder = new AudioRecorder({
// 	program: process.platform === `win32` ? `sox` : `rec`,
// 	silence: 0
// }, console);
//
// if (!fs.existsSync(DIRECTORY)){
// 	fs.mkdirSync(DIRECTORY);
// }


const audioRecorder = new AudioRecorder({
	program: process.platform === `win32` ? `sox` : `rec`,
	silence: 0
}, console);

function start(callback) {
	
	var memoryStream = new MemoryStream();
	audioRecorder.start().stream().pipe(memoryStream);
	
	// const fileName = path.join(DIRECTORY, Math.random().toString(36).replace(/[^a-z]+/g, ``).substr(0, 4).concat(`.wav`));
	// console.log(`Writing new recording file at: `, fileName);
	// const fileStream = fs.createWriteStream(fileName, { encoding: 'binary' });
	
	// audioRecorder.start().stream().pipe(fileStream);
	
	audioRecorder.stream().on(`close`, function(code) {
		console.warn(`Recording closed. Exit code: `, code);
		
		recognize(memoryStream, callback);
		
	});
	audioRecorder.stream().on(`end`, function() {
		console.warn(`Recording ended.`);
		
	});
	audioRecorder.stream().on(`error`, function() {
		console.warn(`Recording error.`);
	});
	
	const stop = function() {
		audioRecorder.stop();
	};
	
	return stop;
}


const recognize = function(memoryStream, callback) {
	console.log('Recognizing ...');
	
	var audioBuffer = memoryStream.toBuffer();
	
	const audioLength = (audioBuffer.length / 2) * ( 1 / 16000);
	console.log('audio length', audioLength);
	
	let result = model.stt(audioBuffer.slice(0, audioBuffer.length / 2), 16000);
	
	console.log('Result:', result);
	
	callback(result);
	
	//
	//
	// const buffer = Fs.readFileSync(fileName);
	// const result = Wav.decode(buffer);
	//
	// if (result.sampleRate < 16000) {
	// 	console.error('Warning: original sample rate (' + result.sampleRate + ') is lower than 16kHz. Up-sampling might produce erratic speech recognition.');
	// 	callback();
	// }
	//
	// function bufferToStream(buffer) {
	// 	var stream = new Duplex();
	// 	stream.push(buffer);
	// 	stream.push(null);
	// 	return stream;
	// }
	//
	// var audioStream = new MemoryStream();
	// bufferToStream(buffer).
	// pipe(Sox({
	// 	global: {
	// 		'no-dither': true,
	// 	},
	// 	output: {
	// 		bits: 16,
	// 		rate: 16000,
	// 		channels: 1,
	// 		encoding: 'signed-integer',
	// 		endian: 'little',
	// 		compression: 0.0,
	// 		type: 'raw'
	// 	}
	// })).
	//
	// pipe(audioStream);
	//
	// audioStream.on('finish', () => {
	//
	// 	var audioBuffer = audioStream.toBuffer();
	//
	// 	const audioLength = (audioBuffer.length / 2) * ( 1 / 16000);
	// 	console.log('audio length', audioLength);
	//
	// 	//let result = model.stt(audioBuffer.slice(0, audioBuffer.length / 2), 16000);
	// 	let result = 'blah';
	//
	// 	console.log('result:', result);
	//
	// 	callback(result);
	// });
};

module.exports = {
	start: start
};

