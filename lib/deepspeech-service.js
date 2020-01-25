const {Client, createLogger} = require('jaxcore');
const fork = require('child_process').fork;
const childProcessPath = __dirname + '/deepspeech-process.js';

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
		defaultValue: 3
	},
	silenceThreshold: {
		type: 'number',
		defaultValue: 200
	},
	recording: {
		type: 'boolean',
		defaultValue: false
	},
	vad: {
		type: 'number',
		defaultValue: 0
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
	}
	
	streamData(chunk) {
		this.proc.send(chunk);
	}
	
	streamEnd() {
		this.proc.send('stream-end');
	}
	
	streamReset() {
		this.proc.send('stream-reset');
	}
	
	_connected() {
		this.log('connected');
		this.setState({
			connected: true
		});
		this.emit('connect');
	}
	
	connect() {
		this.log('connecting');
		
		let proc = fork(childProcessPath, [
			this.state.modelName,
			this.state.modelPath,
			this.state.silenceThreshold || 0,
			this.state.vadMode || 0,
			this.state.debugProcess || 'false'
		]);
		
		if (this.state.debug) {
			this.debugMode(true);
		}
		
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
			else if ('recognize' in data) {
				// console.log('service recognize:', data);
				if (data.recognize.text && data.recognize.stats) {
					this.emit('recognize', data.recognize.text, data.recognize.stats);
				}
			}
			else if ('recording' in data) {
				if (this.state.recording !== data.recording) {
					this.setState({recording: data.recording});
					this.emit('recording', data.recording);
				}
			}
			else if ('vad' in data) {
				this.setState({vad: data.vad});
				this.emit('vad', data.vad);
			}
		});
		
		process.on('exit', () => {
			this.log("killing speech proc");
			proc.kill();
		});
		
		this.proc = proc;
	}
	
	debugMode(on) {
		if (on) {
			this.addListener('recording', onRecording);
			this.addListener('vad', onVAD);
		}
		else {
			this.removeListener('recording', onRecording);
			this.removeListener('vad', onVAD);
		}
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
}

DeepSpeechService.recordingStates = recordingStates;
DeepSpeechService.vadStates = vadStates;

const onRecording = function (recordingState) {
	switch (recordingState) {
		case DeepSpeechService.recordingStates.ON:
			process.stdout.write('\n');
			process.stdout.write('[start]');
			break;
		case DeepSpeechService.recordingStates.OFF:
			process.stdout.write('[stop]');
			process.stdout.write('\n');
			break;
	}
};
const onVAD = function (vadState) {
	switch (vadState) {
		case DeepSpeechService.vadStates.SILENCE:
			process.stdout.write('.');
			break;
		case DeepSpeechService.vadStates.VOICE:
			process.stdout.write('=');
			break;
		case DeepSpeechService.vadStates.IDLE:
			process.stdout.write('-');
			break;
	}
};

module.exports = DeepSpeechService;