const DeepSpeech = require('deepspeech');
const Fs = require('fs');

// const Sox = require('sox-stream');
// const MemoryStream = require('memory-stream');
// const Duplex = require('stream').Duplex;
// const Wav = require('node-wav');

const BEAM_WIDTH = 1024;
const N_FEATURES = 26;
const N_CONTEXT = 9;
let modelPath = './models/output_graph.pbmm';
let alphabetPath = './models/alphabet.txt';

let model = new DeepSpeech.Model(modelPath, N_FEATURES, N_CONTEXT, alphabetPath, BEAM_WIDTH);

var testPcmRecord = require('node-record-lpcm16');

// var fs = require('fs');
// var file = fs.createWriteStream('test.wav', { encoding: 'binary' })

testPcmRecord.start({
	sampleRate : 44100,
	verbose : true
});

// .pipe(file);

let stream = testPcmRecord.start({
	sampleRate : 44100,
	verbose : true
});

setTimeout(function () {
	testPcmRecord.stop();
	
}, 3000);

//record.start

// Stop recording after three seconds


// console.log('stream', stream);
// console.log('model', model);

// var audioBuffer = stream.toBuffer();
//
// const audioLength = (audioBuffer.length / 2) * ( 1 / 16000);
// console.log('audio length', audioLength);

//let result = model.stt(audioBuffer.slice(0, audioBuffer.length / 2), 16000);