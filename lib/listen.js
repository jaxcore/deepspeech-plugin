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
	
	this._processContinous = (res, data) => {
		switch (res) {
			case VAD.Event.ERROR:
				console.log("ERROR");
				break;
			case VAD.Event.NOISE:
				console.log("NOISE");
				break;
			case VAD.Event.SILENCE:
				
				this._processSilence(data);
				break;
			case VAD.Event.VOICE:
				// console.log("VOICE");
				this._recordContinuous(data);
				break;
		}
	};
	
	this.silenceBuffers = [];
	
	this.isRecording = false;
	this.isContinous = false;
	this.isRecognizing = false;
	this.isFinishing = false;
	this.continuousStopped = false;
	
	this.continuousStart = null;
	this.continuousTimeout = 800;
	this.defaultContinuousTimeout = 800;
	this.continuousMaxLength = 10000;
	this.defaultContinuousMaxLength = 10000;
}

Listen.prototype = new EventListener();
Listen.prototype.constructor = EventListener;




Listen.prototype.start = function () {
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
		me.recognize(memoryStream);
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

Listen.prototype.startContinuous = function (options) {
	if (this.continuousRecorder) {
		throw new Error('continuousRecorder already started');
	}
	
	if (options) {
		if (options.continuousTimeout) this.continuousTimeout = options.continuousTimeout;
		if (options.continuousMaxLength) this.continuousMaxLength = options.continuousMaxLength;
	}
	else {
		this.continuousTimeout = this.defaultContinuousTimeout;
		this.continuousMaxLength = this.defaultContinuousMaxLength;
	}
	
	this.continuousStopped = false;
	
	// if (this.isContinous) {
	// 	console.log('isContinous');
	// 	return;
	// }
	// const vad = new VAD(VAD.Mode.NORMAL);
	
	const vad = new VAD(VAD.Mode.LOW_BITRATE);
	// const vad = new VAD(VAD.Mode.AGGRESSIVE);
	// const vad = new VAD(VAD.Mode.VERY_AGGRESSIVE);
	
	this.continuousStart = new Date().getTime();
	
	this.continuousRecorder = new AudioRecorder({
		program: process.platform === `win32` ? `sox` : `rec`,
		silence: 0
	});
	
	let stream = this.continuousRecorder.start().stream();
	
	stream.on('data', (data) => {
		this.isRecording = true;
		
		//console.log('data', chunk);
		
		vad.processAudio(data, 16000).then((res) => {
			this._processContinous(res, data);
		});
		
		
		// vad.processAudio(chunk, 160000, function(error, event) {
		// 	if (event === VAD.EVENT_VOICE) {
		// 		pcmOutputStream.write(chunk)
		// 	}
		// })
	});
};

Listen.prototype.stopContinuous = function () {
	this.continuousStopped = true;
};
Listen.prototype._stopContinuousStream = function () {
	console.log('stop stream');
	this.continuousRecorder.stop();
	delete this.continuousRecorder;
	this.continuousStopped = false;
	// process.exit();
};

Listen.prototype._recordContinuous = function (data) {
	
	if (!this.isRecognizing) {
		console.log('_recordContinuous');
		this.startRecognizing();
		this.continuousStream.write(data);
	} else {
		
		if (this.continuousStream && !this.continuousStream.ended) {
			this.continuousStream.write(data);
		}
		
		if (this.continuousStopped) {
			console.log('stopping');
			this._finishContinuous();
			return;
		}
		
		if (this.isFinishing) {
			if (new Date().getTime() - this.continuousStart > this.continuousMaxLength) {
				console.log('too long');
				return;
			}
			console.log("RECORDING... (cancel finish)");
			this.isFinishing = false;
			clearTimeout(this.segmentTimer);
		}
		else {
			console.log("RECORDING...");
		}
	}
};

Listen.prototype._processSilence = function (data) {
	// clearTimeout(this.segmentTimer);
	if (this.isRecognizing) {
		console.log('r');
		this.continuousStream.write(data);
		
		if (this.continuousStopped) {
			this._finishContinuous();
			return;
		}
		
		if (!this.isFinishing) {
			this.isFinishing = true;
			console.log('finishing in '+this.continuousTimeout+'ms');
			this.segmentTimer = setTimeout(() => {
				console.log('FINISHING');
				// process.exit();
				this._finishContinuous();
			}, this.continuousTimeout);
		}
	}
	else {
		// if (this.silenceStream) {
		// 	this.silenceStream.destroy();
		// }
		// console.log('buffer silence');
		
		let silenceStream = new MemoryStream();
		silenceStream.write(data);
		// silenceStream.end();
		
		// this.silenceBuffers.push(silenceStream.toBuffer());
		console.log(". "+this.silenceBuffers.length);
		
		this.silenceBuffers.push(data);
		if (this.silenceBuffers.length>=3) {
			this.silenceBuffers.shift();
			// shifted.destroy();
		}
	}
};
Listen.prototype._finishContinuous = function () {
	console.log("RECOGNITION OFF");
	this.continuousStream.ended = true;
	this.continuousStream.end();
	this.recognize(this.continuousStream, true);
	
	if (this.silenceStream) {
		this.silenceStream.destroy();
		delete this.silenceStream;
	}
	this.isRecognizing = false;
	this.isFinishing = false;
	
	if (this.continuousStopped) {
		this._stopContinuousStream();
	}
};


Listen.prototype.startRecognizing = function () {
	this.isRecognizing = true;
	this.continuousStream = new MemoryStream();
	console.log("RECOGNITION ON");
	// this.continuousRecorder.start().stream().pipe(memoryStream);
};
Listen.prototype.stopRecognizing = function () {
	this.isRecognizing = false;
	this.continuousRecorder.stop();
};


Listen.prototype.recognize = function (memoryStream, continuous) {
	console.log('Recognizing ...');
	
	let audio = memoryStream.toBuffer();
	
	let audioBuffer;
	if (this.silenceBuffers.length) {
		// for (let i=this.silenceBuffers.length-1;i>0;i--) {
		// 	audioBuffer = Buffer.concat([this.silenceBuffers[i], audioBuffer], this.silenceBuffers.length + audioBuffer.length);
		// }
		
		console.log(this.silenceBuffers.length+' buffers');
		
		this.silenceBuffers.push(audio);
		let length = 0;
		this.silenceBuffers.forEach(function(buf) {
			length += buf.length;
		});
		audioBuffer = Buffer.concat(this.silenceBuffers, length);
		
		this.silenceBuffers = [];
	}
	else audioBuffer = audio;
	
	const audioLength = (audioBuffer.length / 2) * (1 / 16000);
	
	this.emit('recogizing', audioLength);
	
	let start = new Date().getTime();
	let result = this.model.stt(audioBuffer.slice(0, audioBuffer.length / 2), 16000);
	let end = new Date().getTime();
	
	console.log('Stats:', 'length: ' + audioLength + 's', 'recog time: ' + Math.round(100 * (end - start) / 1000) / 100 + ' s');
	
	console.log('Result:', result);
	
	// if (callback) callback(result);
	
	if (continuous) {
		console.log('emit continuous-recognize', result);
		this.emit('continuous-recognize', result);
	}
	else {
		console.log('emit recognize', result);
		this.emit('recognize', result);
	}
	
	memoryStream.destroy();
};

module.exports = Listen;
