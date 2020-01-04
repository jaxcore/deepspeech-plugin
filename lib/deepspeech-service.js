const {Service, createLogger} = require('jaxcore');

const fork = require('child_process').fork;
const childProcessPath = __dirname + '/deepspeech-process.js';

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
	isRecording: {
		type: 'boolean',
		defaultValue: false
	},
	isStreaming: {
		type: 'boolean',
		defaultValue: false
	}
};

let _instance = 0;

const speechInstances = {};

class DeepSpeechService extends Service {
	constructor(store, defaults) {
		super(schema, store, defaults);
		
		this.log = createLogger('SpeechService:' + (_instance++));
		this.log('create', defaults);
		
		this.serviceType = 'speech';
		
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
			this.state.debug || 'false',
		]);
		
		proc.on('exit', (code, sig) => {
			this.log('proc.on(\'exit\')', code);
			process.exit();
		});
		
		proc.on('error', (error) => {
			this.log('speech process error', error);
			process.exit();
		});
		
		proc.on('message',(data) => {
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
		});
		
		process.on('exit', () => {
			this.log("killing speech proc");
			proc.kill();
		});
		
		this.proc = proc;
	}
	
	static id(serviceConfig) {
		return 'deepspeech:'+serviceConfig.modelName;
	}
	
	static getOrCreateInstance(serviceStore, serviceId, serviceConfig, callback) {
		if (speechInstances[serviceId]) {
			let instance = speechInstances[serviceId];
			// instance.log('RETURNING DEEPSPEECH CLIENT', instance);
			callback(null, instance);
		}
		else {
			// console.log('CREATE DEEPSPEECH', serviceId, serviceConfig);
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

module.exports = DeepSpeechService;