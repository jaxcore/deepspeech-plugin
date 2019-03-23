// records for 5 seconds then processes result

const fs = require(`fs`);
const path = require(`path`);
const AudioRecorder = require(`node-audiorecorder`);
const MemoryStream = require('memory-stream');
// const Duplex = require('stream').Duplex;
// const Wav = require('node-wav');

const DeepSpeech = require('deepspeech');
const BEAM_WIDTH = 1024;
const N_FEATURES = 26;
const N_CONTEXT = 9;

let modelPath = __dirname+'/models/output_graph.pbmm';
let alphabetPath = __dirname+'/models/alphabet.txt';

if (!fs.existsSync(modelPath)){
	console.log('Model does not exist:', modelPath);
	process.exit();
}

if (!fs.existsSync(alphabetPath)){
	console.log('Alphabet does not exist:', alphabetPath);
	process.exit();
}

let model = new DeepSpeech.Model(modelPath, N_FEATURES, N_CONTEXT, alphabetPath, BEAM_WIDTH);

//const fileStream = fs.createWriteStream(fileName, { encoding: 'binary' });

var memoryStream = new MemoryStream();

const audioRecorder = new AudioRecorder({
	program: process.platform === `win32` ? `sox` : `rec`,
	silence: 0
}, console);

audioRecorder.start().stream().pipe(memoryStream);

audioRecorder.stream().on(`close`, function(code) {
	console.warn(`Recording closed. Exit code: `, code);
	
	// console.log(memoryStream);
	
	var audioBuffer = memoryStream.toBuffer();
	
	const audioLength = (audioBuffer.length / 2) * ( 1 / 16000);
	console.log('audio length', audioLength);
	
	let result = model.stt(audioBuffer.slice(0, audioBuffer.length / 2), 16000);
	console.log('Result:', result);
	
	// const result = Wav.decode(memoryStream);
	//
	// if (result.sampleRate < 16000) {
	// 	console.error('Warning: original sample rate (' + result.sampleRate + ') is lower than 16kHz. Up-sampling might produce erratic speech recognition.');
	// 	// callback();
	// }
	// else {
	// 	console.log('sampleRate:',result.sampleRate);
	// }
	
	// recognize(fileName, callback);
	
});

// audioRecorder.stream().on(`end`, function() {
// 	console.warn(`Recording ended.`);
//
// });
// audioRecorder.stream().on(`error`, function() {
// 	console.warn(`Recording error.`);
// });

setTimeout(function() {
	audioRecorder.stop();
},5000);