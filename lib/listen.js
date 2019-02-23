const EventListener = require('events');
const DeepSpeech = require('deepspeech');
const Fs = require('fs');
const MemoryStream = require('memory-stream');
const fs = require(`fs`);
const path = require(`path`);
const AudioRecorder = require(`node-audiorecorder`);

function Listen(config) {
	this.constructor();
	
	const BEAM_WIDTH = 1024;
	const N_FEATURES = 26;
	const N_CONTEXT = 9;
	
	this.modelPath = config.modelPath;
	this.alphabetPath = config.alphabetPath;
	
	if (!Fs.existsSync(this.modelPath)){
		console.log('Model does not exist:', this.modelPath);
		// process.exit();
		return;
	}
	
	if (!Fs.existsSync(this.alphabetPath)){
		console.log('Alphabet does not exist:', this.alphabetPath);
		// process.exit();
		return;
	}
	
	this.model = new DeepSpeech.Model(this.modelPath, N_FEATURES, N_CONTEXT, this.alphabetPath, BEAM_WIDTH);
	
	this.audioRecorder = new AudioRecorder({
		program: process.platform === `win32` ? `sox` : `rec`,
		silence: 0
	}, console);
}

Listen.prototype = new EventListener();
Listen.prototype.constructor = EventListener;

Listen.prototype.start = function(callback) {
	if (!this.model) {
		console.log('Model not loaded', 'modelPath='+this.modelPath, 'alphabetPath='+this.alphabetPath);
		return;
	}
	if (this.isRecording) {
		console.log('already recording');
		return;
	}
	
	var memoryStream = new MemoryStream();
	
	this.isRecording = true;
	this.audioRecorder.start().stream().pipe(memoryStream);
	
	// const fileName = path.join(DIRECTORY, Math.random().toString(36).replace(/[^a-z]+/g, ``).substr(0, 4).concat(`.wav`));
	// console.log(`Writing new recording file at: `, fileName);
	// const fileStream = fs.createWriteStream(fileName, { encoding: 'binary' });
	
	// audioRecorder.start().stream().pipe(fileStream);
	
	var me = this;
	this.audioRecorder.stream().on(`close`, function(code) {
		console.warn(`Recording closed. Exit code: `, code);
		me.isRecording = false;
		me.recognize(memoryStream, callback);
	});
	this.audioRecorder.stream().on(`end`, function() {
		console.warn(`Recording ended.`);
	});
	this.audioRecorder.stream().on(`error`, function() {
		console.warn(`Recording error.`);
	});
};

Listen.prototype.stop = function() {
	this.audioRecorder.stop();
};

Listen.prototype.recognize = function(memoryStream, callback) {
	console.log('Recognizing ...');
	
	var audioBuffer = memoryStream.toBuffer();
	
	const audioLength = (audioBuffer.length / 2) * ( 1 / 16000);
	
	this.emit('recogizing', audioLength);
	
	console.log('audio length', audioLength);
	
	let result = this.model.stt(audioBuffer.slice(0, audioBuffer.length / 2), 16000);
	
	console.log('Result:', result);
	
	if (callback) callback(result);
	
	this.emit('recogized', result);
	
};

module.exports = Listen;
