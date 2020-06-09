const {Client, createLogger} = require('jaxcore');
const fork = require('child_process').fork;
const childProcessPath = __dirname + '/deepspeech-process.js';
const VAD = require('node-vad');
const pcmConvert = require('pcm-convert');
const {recordingStates, vadStates} = require('./constants');

const schema = {
	id: {
		type: 'string',
		defaultValue: 'speech'
	},
	connected: {
		type: 'boolean',
		defaultValue: false
	},
	modelName: {
		type: 'string'
	},
	modelPath: {
		type: 'string'
	},
	vadMode: {
		type: 'string',
		defaultValue: 'VERY_AGGRESSIVE'
	},
	silenceThreshold: {
		type: 'number',
		defaultValue: 200
	},
	recording: {
		type: 'boolean',
		defaultValue: false
	},
	debug: {
		type: 'boolean',
		defaultValue: false
	},
	debugProcess: {
		type: 'boolean',
		defaultValue: false
	},
};

let _instance = 0;

const speechInstances = {};

class DeepSpeechService extends Client {
	constructor(store, defaults) {
		super(schema, store, defaults);
		
		this.log = createLogger('SpeechService:' + (_instance++));
		this.log('create', defaults);
		
		this.serviceType = 'deepspeech';
		this.deviceType = 'deepspeech';
		
		speechInstances[this.id] = this;
		
		this.vad = new VAD(VAD.Mode[this.state.vadMode]);
		this.endTimeout = null;
		
		this.silenceStart = null;
		this.silenceBuffers = [];
		this.recordedChunks = 0;
		this.lastSilenceChunk = null;
	}
	
	dualStreamData(intData, floatData, sampleRate, hotword) {
		this._streamData(intData, floatData, sampleRate, true, hotword);
	}
	
	streamData(intData, sampleRate) {
		this._streamData(intData, null, sampleRate, false);
	}
	
	_streamData(deepspeechData, vadData, sampleRate, useFloat, hotword) {
		if (hotword) {
			this.log('SET HOTWORD', hotword);
			this.setState({hotword});
		}
		let method = useFloat? 'processAudioFloat' : 'processAudio';
		this.vad[method](vadData, sampleRate || 16000).then((res) => {
			switch (res) {
				case VAD.Event.ERROR:
					console.log("VAD ERROR", res);
					break;
				case VAD.Event.NOISE:
					console.log("VAD NOISE");
					break;
				case VAD.Event.SILENCE:
					// process.stdout.write('.');
					// return;
					
					this.processSilence(deepspeechData);
					
					break;
				case VAD.Event.VOICE:
					// process.stdout.write('=');
					this.processVoice(deepspeechData);
					break;
			}
		}).catch(e => {
			console.log('err', e);
		})
		
		clearTimeout(this.endTimeout);
		this.endTimeout = setTimeout(() => {
			this.println('[timeout]');
			this.sendRecordingState(recordingStates.OFF);
			this.streamReset();
		}, 1000); // stream will time out after 1 second
	}
	
	streamEnd() {
		clearTimeout(this.endTimeout);
		// this.disableHotword();
		this.sendRecordingState(recordingStates.OFF);
		this.recordedChunks = 0;
		this.silenceStart = null;
		this.proc.send('stream-end');
		
		if (this.lastSilenceChunk) {
			this.silenceBuffers = [this.lastSilenceChunk];
			this.lastSilenceChunk = null;
			// console.log('check this.silenceBuffers', this.silenceBuffers);
		}
	}
	
	disableHotword() {
		if (this.state.hotword) {
			console.log('hotword was', this.state.hotword);
			this.setState({hotword: null});
		}
	}
	
	streamReset() {
		clearTimeout(this.endTimeout);
		this.disableHotword();
		this.sendRecordingState(recordingStates.OFF);
		this.println('[reset]');
		this.recordedChunks = 0;
		this.silenceStart = null;
		try {
			this.proc.send('stream-reset');
		}
		catch(e) {
			console.log('DeepSpeech service reset error', e);
		}
	}
	
	_connected() {
		this.log('connected');
		this.setState({
			connected: true
		});
		this.emit('connect');
	}
	
	disconnect() {
		this.setState({
			connected: false
		});
		this.emit('connect');
	}
	
	connect() {
		this.log('connecting');
		
		let proc = fork(childProcessPath, [
			this.state.modelName,
			this.state.modelPath,
			this.state.debugProcess || 'false'
		]);
		
		proc.on('exit', (code, sig) => {
			this.log('proc.on(\'exit\')', code);
			process.exit();
		});
		
		proc.on('error', (error) => {
			this.log('speech process error', error);
			process.exit();
		});
		
		proc.on('message', (data) => {
			if (typeof data !== 'object') {
				console.error('data', data);
				return;
			}
			
			if (data.ready === true) {
				this.log('process ready');
				this._connected();
			}
			else if ('noRecognition' in data) {
				this.emit('no-recognition', this.state.hotword);
				// if (this.state.hotword) {
				// 	console.log('noRecognition hotword was set', this.state.hotword);
				// 	this.setState({
				// 		hotword: null
				// 	});
				// 	console.log('noRecognition hotword now', this.state.hotword);
				// }
			}
			else if ('recognize' in data) {
				if (data.recognize.text && data.recognize.stats) {
					
					let text = data.recognize.text;
					
					if (this.state.hotword) {
						if (data.recognize.stats.hotword && /^[a-z]+$/.test(text) || // any single word returned from deepspeech is assumed to be the hotword
							text === this.state.hotword ||
							text === 'bumble bee'  // need a list of hotword alternates
						) {
							console.log('HOTWORD WAS recognized');
						}
						else {
							console.log('hotword was set', this.state.hotword);
							
							data.recognize.stats.hotword = this.state.hotword;
							
							this.emit('hotword', this.state.hotword, text, data.recognize.stats);
							this.setState({
								hotword: null
							});
							console.log('hotword now', this.state.hotword);
						}
					}
					else {
						this.emit('recognize', text, data.recognize.stats);
						
						// if (this.state.hotword) {
						// 	console.log('hotword was', this.state.hotword);
						
						// let hotwordSubstitutions = [
						// 	'bumble bee',
						// 	'tumbled on',
						// 	'bumble',
						// 	'numbly',
						// 	'monte',
						// 	'mumbled',
						// 	'mumbled the',
						// 	'one two three',
						// 	'dumbly'
						// ];
						//
						// for (let i=0;i<hotwordSubstitutions.length;i++) {
						// 	if (text === hotwordSubstitutions[i]) {
						// 		console.log('HOTWORD EXACT');
						// 		return;
						// 	}
						// 	if (text.startsWith(hotwordSubstitutions[i])) {
						// 		console.log('HOTWORD REPLACE', hotwordSubstitutions[i]);
						// 		text = text.substring(hotwordSubstitutions[i].length + 1);
						// 		console.log('after', text);
						// 		break;
						// 	}
						// }
						// if (!text) {
						// 	console.log('hs text now empty');
						// 	return;
						// }
						// }
						
						// data.recognize.stats.hotword = this.state.hotword;
						//
						// if (text !== data.recognize.text) {
						// 	data.recognize.stats.original = data.recognize.text;
						// }
						
						if (this.state.hotword) {
						
						}
						else {
						
						}
					}
				}
			}
		});
		
		process.on('exit', () => {
			this.log("killing speech proc");
			proc.kill();
		});
		
		this.proc = proc;
	}
	
	// setHotword(hotword) {
	// 	if (hotword) {
	// 		if (this.state.hotword) {
	// 			throw new Error('hotword already active', this.state.hotword);
	// 		}
	// 		console.log('hotword is now', hotword);
	// 		this.setState({
	// 			hotword
	// 		});
	// 	}
	// }
	
	sendRecordingState(recordingState) {
		if (this.state.recording !== recordingState) {
			if (recordingState === recordingStates.ON) {
			
			}
			
			if (recordingState === recordingStates.OFF) {
			
			}
			
			this.setState({recording: recordingState});
			this.emit('recording', recordingState);
			if (this.state.debug) {
				onRecording(recordingState);
			}
		}
	}
	
	sendVADState(vad) {
		if (this.state.vad !== vad) {
			this.setState({vad});
			this.emit('vad', vad);
		}
		if (this.state.debug) onVAD(vad);
	}
	
	processSilence(data) {
		if (this.recordedChunks > 0) { // recording is on
			this.sendVADState(vadStates.IDLE);
			this.proc.send(data);
			
			if (this.silenceStart === null) {
				this.silenceStart = new Date().getTime();
			}
			else {
				let now = new Date().getTime();
				if (now - this.silenceStart > this.state.silenceThreshold) {
					this.lastSilenceChunk = data;
					this.silenceStart = null;
					this.sendRecordingState(recordingStates.OFF);
					this.streamEnd();
				}
			}
		}
		else {
			this.sendVADState(vadStates.SILENCE);
			if (data) this.bufferSilence(data);
		}
	}
	
	processVoice(data) {
		this.silenceStart = null;
		
		if (this.recordedChunks === 0) {
			this.sendRecordingState(recordingStates.ON);
		}
		else {
			this.sendVADState(vadStates.VOICE);
		}
		this.recordedChunks++;
		data = this.addBufferedSilence(data);
		this.proc.send(data);
	}
	
	bufferSilence(data) {
		// VAD has a tendency to cut the first bit of audio data from the start of a recording
		// so keep a buffer of that first bit of audio and in addBufferedSilence() reattach it to the beginning of the recording
		
		this.silenceBuffers.push(data);
		if (this.silenceBuffers.length >= 3) {
			this.silenceBuffers.shift();
		}
	}
	
	addBufferedSilence(data) {
		let audioBuffer;
		if (this.silenceBuffers.length) {
			this.silenceBuffers.push(data);
			let length = 0;
			this.silenceBuffers.forEach(function (buf) {
				length += buf.length;
			});
			audioBuffer = Buffer.concat(this.silenceBuffers, length);
			this.silenceBuffers = [];
		}
		else audioBuffer = data;
		return audioBuffer;
	}
	
	println() {
		if (this.state.debug) console.log.apply(null, Array.from(arguments));
	}
	
	print() {
		if (this.state.debug) process.stdout.write(Array.from(arguments).join(','));
	}
	
	destroy() {
		this.proc.send('destroy');
		this.proc.removeAllListeners();
		this.proc.kill();
		this.disconnect();
	}
	
	static id(serviceConfig) {
		return 'deepspeech:' + serviceConfig.modelName;
	}
	
	static getOrCreateInstance(serviceStore, serviceId, serviceConfig, callback) {
		if (speechInstances[serviceId]) {
			let instance = speechInstances[serviceId];
			callback(null, instance);
		}
		else {
			let instance = new DeepSpeechService(serviceStore, {
				id: serviceId,
				modelName: serviceConfig.modelName,
				modelPath: serviceConfig.modelPath,
				silenceThreshold: serviceConfig.silenceThreshold,
				vadMode: serviceConfig.vadMode,
				debug: serviceConfig.debug
			});
			
			callback(null, instance, true);
		}
	}
	
	static getInstance(serviceId) {
		return speechInstances[serviceId];
	}
}

DeepSpeechService.recordingStates = recordingStates;
DeepSpeechService.vadStates = vadStates;

const onRecording = function (recordingState) {
	switch (recordingState) {
		case recordingStates.ON:
			process.stdout.write('\n');
			process.stdout.write('[start]');
			break;
		case recordingStates.OFF:
			process.stdout.write('[stop]');
			process.stdout.write('\n');
			break;
	}
};
const onVAD = function (vadState) {
	switch (vadState) {
		case vadStates.SILENCE:
			process.stdout.write('.');
			break;
		case vadStates.VOICE:
			process.stdout.write('=');
			break;
		case vadStates.IDLE:
			process.stdout.write('-');
			break;
	}
};

module.exports = DeepSpeechService;