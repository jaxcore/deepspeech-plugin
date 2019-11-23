const {Service, createServiceStore, createLogger} = require('jaxcore-plugin');
const DeepSpeech = require('deepspeech');
// const DeepSpeech = require('../deepspeech-node');

const Fs = require('fs');
const MemoryStream = require('memory-stream');
const AudioRecorder = require(`node-audiorecorder`);
const VAD = require('node-vad');

let speechInstance = null;

const schema = {
	id: {
		type: 'string',
		defaultValue: 'mouse'
	},
	connected: {
		type: 'boolean',
		defaultValue: false
	},
	models: {
		type: 'object'
	},
	defaultModel: {
		type: 'string'
	}
};

const deepSpeechDefaults = {
	BEAM_WIDTH: 1024,
	N_FEATURES: 26,
	N_CONTEXT: 9,
	LM_ALPHA: 0.75,
	LM_BETA: 1.85
};

class SpeechService extends Service {
	constructor(defaults, store) {
		if (!store) store = createServiceStore('Speech');
		super(schema, store, defaults);
		this.log = createLogger('Speech');
		this.log('created');
		
		this.serviceType = 'speech';
		
		this.deepSpeechModels = {};
		
		for (let modelName in this.state.models) {
			this.addModel(modelName, this.state.models[modelName].path, this.state.models[modelName].deepSpeechSettings);
		}
		
		this.audioRecorder = new AudioRecorder({
			program: process.platform === 'win32' ? 'sox' : 'rec',
			silence: 0
		});
		
		this._processContinous = this.processContinous.bind(this);
		
		this.silenceBuffers = [];
		
		this.isRecording = false;
		this.isContinous = false;
		this.isRecognizing = false;
		this.isFinishing = false;
		this.continuousStopped = false;
		
		this.continuousStart = null;
		this.continuousTimeout = 750;
		this.defaultContinuousTimeout = 750;
		this.continuousMaxLength = 12000;
		this.defaultContinuousMaxLength = 12000;
		
		this.defaultVadLevel = 'high';
		this.vadLevels = ['low', 'medium', 'high', 'max'];
		this.vadBitrates = ['LOW_BITRATE', 'NORMAL', 'AGGRESSIVE', 'VERY_AGGRESSIVE'];
	}
	
	processContinous(res, data) {
		switch (res) {
			case VAD.Event.ERROR:
				this.log("ERROR");
				break;
			case VAD.Event.NOISE:
				this.log("NOISE");
				break;
			case VAD.Event.SILENCE:
				this._processSilence(data);
				break;
			case VAD.Event.VOICE:
				// this.log("VOICE");
				this._recordContinuous(data);
				break;
		}
	};
	
	addModel(modelName, modelDir, modelDeepSpeechSettings) {
		let modelPath = modelDir + '/output_graph.pbmm';
		let alphabetPath = modelDir + '/alphabet.txt';
		let lmPath = modelDir + '/lm.binary';
		let triePath = modelDir + '/trie';
		
		if (Fs.existsSync(modelPath) &&
			Fs.existsSync(alphabetPath) &&
			Fs.existsSync(lmPath) &&
			Fs.existsSync(triePath)) {
			
			let settings = Object.assign({}, deepSpeechDefaults, modelDeepSpeechSettings);
			this.deepSpeechModels[modelName] = new DeepSpeech.Model(modelPath, settings.N_FEATURES, settings.N_CONTEXT, alphabetPath, settings.BEAM_WIDTH);
			this.deepSpeechModels[modelName].enableDecoderWithLM(alphabetPath, lmPath, triePath, settings.LM_ALPHA, settings.LM_BETA);
			
			if (!this.state.defaultModel) {
				this.setState({
					defaultModel: modelName
				});
			}
		}
	}
	
	start(modelName) {
		if (this.isRecording) {
			this.log('already recording');
			return;
		}
		
		this.useModel(modelName);
		if (!this.currentModel) return;
		
		let memoryStream = new MemoryStream();
		
		this.isContinous = false;
		this.isRecording = true;
		this.audioRecorder.start().stream().pipe(memoryStream);
		
		// const fileName = path.join(DIRECTORY, Math.random().toString(36).replace(/[^a-z]+/g, ``).substr(0, 4).concat(`.wav`));
		// this.log(`Writing new recording file at: `, fileName);
		// const fileStream = fs.createWriteStream(fileName, { encoding: 'binary' });
		
		// audioRecorder.start().stream().pipe(fileStream);
		
		this.log('.s');
		
		this.audioRecorder.stream().on(`close`, (code) => {
			this.log(`Recording closed. Exit code: `, code);
			this.isRecording = false;
			this.recognize(memoryStream);
		});
		
		this.audioRecorder.stream().on(`end`, () => {
			this.log(`Recording ended.`);
		});
		this.audioRecorder.stream().on(`error`, () => {
			this.log(`Recording error.`);
		});
	}
	
	stop() {
		this.audioRecorder.stop();
	}
	
	useModel(modelName) {
		if (!modelName) modelName = this.state.defaultModel;
		let model = this.deepSpeechModels[modelName];
		if (!model) {
			this.log('no model:', modelName);
			this.currentModel = null;
			return;
		}
		this.currentModel = model;
	}
	startContinuous(options) {
		this.useModel(options? options.model:null);
		if (!this.currentModel) return;
		
		this.isContinous = true;
		
		if (this.continuousRecorder) {
			throw new Error('continuousRecorder already started');
		}
		
		if (options) {
			this.log('startContinuous options', options);
			debugger;
		}
		if (!options) options = {};
		
		if (options.continuousTimeout) this.continuousTimeout = options.continuousTimeout;
		else this.continuousTimeout = this.defaultContinuousTimeout;
		
		if (options.continuousMaxLength) this.continuousMaxLength = options.continuousMaxLength;
		else this.continuousMaxLength = this.defaultContinuousMaxLength;
		
		let vadLevel;
		if (options.vadLevel && this.vadLevels.indexOf(options.vadLevel) > -1) vadLevel = options.vadLevel;
		else vadLevel = this.defaultVadLevel;
		
		this.isContinous = true;
		this.continuousStopped = false;
		
		// if (this.isContinous) {
		// 	this.log('isContinous');
		// 	return;
		// }
		
		let bitrateIndex = this.vadLevels.indexOf(vadLevel);
		let bitrate = this.vadBitrates[bitrateIndex];
		
		const vad = new VAD(VAD.Mode[bitrate]);
		
		// const vad = new VAD(VAD.Mode.NORMAL);
		// const vad = new VAD(VAD.Mode.LOW_BITRATE);
		// const vad = new VAD(VAD.Mode.AGGRESSIVE);
		// const vad = new VAD(VAD.Mode.VERY_AGGRESSIVE);
		
		this.continuousRecorder = new AudioRecorder({
			program: process.platform === `win32` ? `sox` : `rec`,
			silence: 0
		});
		
		let stream = this.continuousRecorder.start().stream();
		
		stream.on('data', (data) => {
			this.isRecording = true;
			
			vad.processAudio(data, 16000).then((res) => {
				this._processContinous(res, data);
			});
		});
	}
	
	stopContinuous() {
		this.continuousStopped = true;
		this.isContinous = false;
	}
	
	_stopContinuousStream() {
		this.log('stop stream');
		this.continuousRecorder.stop();
		delete this.continuousRecorder;
		this.continuousStopped = false;
		this.isRecognizing = false;
		this.isFinishing = false;
		// process.exit();
	}
	
	_recordContinuous(data) {
		if (this.continuousStopped) {
			// this.log('_recordContinuous stopping');
			this.log('.s');
			this._finishContinuous();
			// process.exit();
			return;
		}
		
		if (!this.isRecognizing) {
			// this.log('_recordContinuous');
			this.log('.c');
			this.startRecognizing();
			this.continuousStream.write(data);
		}
		else {
			
			if (this.continuousStream && !this.continuousStream.ended) {
				this.continuousStream.write(data);
			}
			
			if (this.isFinishing) {
				if (new Date().getTime() - this.continuousStart > this.continuousMaxLength) {
					this.log('too long');
					return;
				}
				// this.log("RECORDING... (cancel finish)");
				this.log('.');
				this.isFinishing = false;
				clearTimeout(this.segmentTimer);
			}
			else {
				// this.log("RECORDING...");
				this.log('.');
			}
		}
	}
	
	_processSilence(data) {
		// clearTimeout(this.segmentTimer);
		if (this.isRecognizing) {
			this.log('.r');
			this.continuousStream.write(data);
			
			if (this.continuousStopped) {
				this._finishContinuous();
				return;
			}
			
			if (!this.isFinishing) {
				this.isFinishing = true;
				// this.log('finishing in '+this.continuousTimeout+'ms');
				this.log('.x');
				this.segmentTimer = setTimeout(() => {
					// this.log('FINISHING');
					this.log('.X');
					// process.exit();
					this._finishContinuous();
				}, this.continuousTimeout);
			}
		}
		else {
			
			if (this.continuousStopped) {
				this.log('silence not recognizing stopping');
				this._stopContinuousStream();
				return;
			}
			
			let silenceStream = new MemoryStream();
			silenceStream.write(data);
			this.log('.'); //+this.silenceBuffers.length);
			
			this.silenceBuffers.push(data);
			if (this.silenceBuffers.length >= 3) {
				this.silenceBuffers.shift();
				// shifted.destroy();
			}
		}
	}
	
	_finishContinuous() {
		// this.log("RECOGNITION OFF");
		this.log('.off');
		this.continuousStream.ended = true;
		this.continuousStream.end();
		this.recognize(this.continuousStream);
		
		if (this.silenceStream) {
			this.silenceStream.destroy();
			delete this.silenceStream;
		}
		this.isRecognizing = false;
		this.isFinishing = false;
		
		if (this.continuousStopped) {
			this._stopContinuousStream();
		}
	}
	
	startRecognizing() {
		this.continuousStart = new Date().getTime();
		this.isRecognizing = true;
		this.continuousStream = new MemoryStream();
		// this.log('RECOGNITION ON'); // todo: this method gets called after stopContinuous
		this.log('.on'); // todo: this method gets called after stopContinuous
		// this.continuousRecorder.start().stream().pipe(memoryStream);
	}
	
	recognize(memoryStream) {
		this.log('Recognizing ...');
		
		let audio = memoryStream.toBuffer();
		
		let audioBuffer;
		if (this.silenceBuffers.length) {
			//this.log(this.silenceBuffers.length + ' buffers');
			
			this.silenceBuffers.push(audio);
			let length = 0;
			this.silenceBuffers.forEach(function (buf) {
				length += buf.length;
			});
			audioBuffer = Buffer.concat(this.silenceBuffers, length);
			
			this.silenceBuffers = [];
		}
		else audioBuffer = audio;
		
		const audioLength = (audioBuffer.length / 2) * (1 / 16000);
		
		this.emit('recogizing', audioLength);
		
		let start = new Date().getTime();
		let result = this.currentModel.stt(audioBuffer.slice(0, audioBuffer.length / 2), 16000);
		let end = new Date().getTime();
		let recogTime = end - start;
		let stats = {
			audioLength,
			recogTime,
			isContinous: this.isContinous
		};
		this.log('Stats:', 'length: ' + audioLength + 's', 'recog time: ' + Math.round(100 * (end - start) / 1000) / 100 + ' s');
		
		this.emit('recognize', result, stats);
		
		memoryStream.destroy();
	}
	
	connect() {
		this.setState({connected:true});
		this.emit('connect');
	}
	
	destroy() {
		this.emit('teardown');
		speechInstance = null;
	}
	
	static id(config, store) {
		return 'speech';
	}
	
	static getOrCreateInstance(serviceStore, serviceId, serviceConfig, callback) {
		if (!speechInstance) {
			console.log('CREATE SPEECH', 'serviceStore=', serviceStore);
			speechInstance = new SpeechService(serviceConfig, serviceStore);
		}
		callback(null, speechInstance, true);
	}
	
	static destroyInstance(serviceId, serviceConfig) {
		if (speechInstance) {
			speechInstance.destroy();
		}
	}
}

module.exports = SpeechService;
