const EventListener = require('events');
const DeepSpeech = require('deepspeech');
const Fs = require('fs');
const MemoryStream = require('memory-stream');
// const path = require(`path`);
const AudioRecorder = require(`node-audiorecorder`);
const VAD = require('node-vad');

function Listen(config) {
	this.constructor();
	
	if (!config) config = {};
	
	const BEAM_WIDTH = 1024;
	const N_FEATURES = 26;
	const N_CONTEXT = 9;
	const LM_ALPHA = 0.75;
	const LM_BETA = 1.85;
	
	this.modelPath = config.modelPath || __dirname + '/../models/output_graph.pbmm';
	this.alphabetPath = config.alphabetPath || __dirname + '/../models/alphabet.txt';
	this.lmPath = config.lmPath || __dirname + '/../models/lm.binary';
	this.triePath = config.alphabetPath || __dirname + '/../models/trie';
	
	if (!Fs.existsSync(this.modelPath)) {
		console.log('Model does not exist:', this.modelPath);
		return;
	}
	
	if (!Fs.existsSync(this.alphabetPath)) {
		console.log('Alphabet does not exist:', this.alphabetPath);
		return;
	}
	
	this.model = new DeepSpeech.Model(this.modelPath, N_FEATURES, N_CONTEXT, this.alphabetPath, BEAM_WIDTH);
	
	if (Fs.existsSync(this.lmPath) && Fs.existsSync(this.triePath)) {
		this.model.enableDecoderWithLM(this.alphabetPath, this.lmPath, this.triePath, LM_ALPHA, LM_BETA);
	}
	
	this.audioRecorder = new AudioRecorder({
		program: process.platform === `win32` ? `sox` : `rec`,
		silence: 0
	});
}

Listen.prototype = new EventListener();
Listen.prototype.constructor = EventListener;

Listen.prototype.start = function (callback) {
	if (!this.model) {
		console.log('Model not loaded', 'modelPath=' + this.modelPath, 'alphabetPath=' + this.alphabetPath);
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
	this.audioRecorder.stream().on(`close`, function (code) {
		console.warn(`Recording closed. Exit code: `, code);
		me.isRecording = false;
		me.recognize(memoryStream, callback);
	});
	this.audioRecorder.stream().on(`end`, function () {
		console.warn(`Recording ended.`);
	});
	this.audioRecorder.stream().on(`error`, function () {
		console.warn(`Recording error.`);
	});
};

Listen.prototype.stop = function () {
	this.audioRecorder.stop();
};

Listen.prototype.startContinuous = function () {
	const vad = new VAD(VAD.Mode.NORMAL);
	
	this.continuousRecorder = new AudioRecorder({
		program: process.platform === `win32` ? `sox` : `rec`,
		silence: 0
	});
	
	let stream = this.continuousRecorder.start().stream();
	
	stream.on('data', (chunk) => {
		this.isRecording = true;
		
		//console.log('data', chunk);
		
		vad.processAudio(chunk, 16000).then((res, x) => {
			
			switch (res) {
				case VAD.Event.ERROR:
					console.log("ERROR");
					break;
				case VAD.Event.NOISE:
					console.log("NOISE");
					break;
				case VAD.Event.SILENCE:
					if (this.isRecognizng) {
						this.isRecognizng = false;
						console.log("RECOGNITION OFF");
						this.continuousStream.end(chunk);
						this.recognize(this.continuousStream);
					}
					break;
				case VAD.Event.VOICE:
					
					let turnedOn = false;
					if (!this.isRecognizng) {
						this.startRecognizing();
						turnedOn = true;
						console.log("RECOGNITION ON");
					}
					else {
						console.log("RECORDING...");
					}
					
					this.continuousStream.write(chunk);
					
					break;
			}
		});
		
		// vad.processAudio(chunk, 160000, function(error, event) {
		// 	if (event === VAD.EVENT_VOICE) {
		// 		pcmOutputStream.write(chunk)
		// 	}
		// })
	});
};

Listen.prototype.startRecognizing = function () {
	this.isRecognizng = true;
	this.continuousStream = new MemoryStream();
	// this.continuousRecorder.start().stream().pipe(memoryStream);
};
Listen.prototype.stopRecognizing = function () {
	this.isRecognizng = false;
	this.continuousRecorder.stop();
};

Listen.prototype.stopContinuous = function () {

};

Listen.prototype.recognize = function (memoryStream, callback) {
	console.log('Recognizing ...');
	
	var audioBuffer = memoryStream.toBuffer();
	
	const audioLength = (audioBuffer.length / 2) * (1 / 16000);
	
	this.emit('recogizing', audioLength);
	
	let start = new Date().getTime();
	let result = this.model.stt(audioBuffer.slice(0, audioBuffer.length / 2), 16000);
	let end = new Date().getTime();
	
	console.log('Stats:', 'length: ' + audioLength + 's', 'recog time: ' + Math.round(100 * (end - start) / 1000) / 100 + ' s');
	
	console.log('Result:', result);
	
	if (callback) callback(result);
	
	this.emit('recogized', result);
	
};

module.exports = Listen;
