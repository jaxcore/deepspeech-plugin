const {Service, createLogger} = require('jaxcore');

const { Worker } = require('worker_threads');
const workerPath = __dirname + '/deepspeech-worker.js';

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
	modelOptions: {
		type: 'object'
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
		
		this.log = createLogger('DeepSpeechService:' + (_instance++));
		this.log('create', defaults);
		
		this.serviceType = 'deepspeech';
		
		speechInstances[this.id] = this;
	}
	
	streamData(data) {
		this.postMessage({
			data
		});
	}
	streamEnd() {
		this.postMessage('stream-end');
	}
	streamReset() {
		this.postMessage('stream-reset');
	}
	
	postMessage(msg) {
		if (this.worker) {
			this.worker.postMessage(msg);
		}
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
		
		this.worker = new Worker(workerPath);
		
		this.worker.on('message',(data) => {
			if (data === 'worker-ready') {
				this.log('worker ready');
				this._connected();
			}
			else if ('recognize' in data) {
				this.log('worker recognize:', data);
				if (data.recognize.text && data.recognize.stats) {
					this.emit('recognize', data.recognize.text, data.recognize.stats);
				}
			}
		});
		
		this.postMessage({
			model: {
				name: this.state.modelName,
				path: this.state.modelPath,
				options: this.state.modelOptions
			}
		});
	}
	
	static id(serviceConfig) {
		return 'deepspeech:'+serviceConfig.modelName;
	}
	
	static getOrCreateInstance(serviceStore, serviceId, serviceConfig, callback) {
		if (speechInstances[serviceId]) {
			let instance = speechInstances[serviceId];
			instance.log('RETURNING DEEPSPEECH', instance);
			callback(null, instance);
		}
		else {
			console.log('CREATE DEEPSPEECH', serviceId, serviceConfig);
			
			let instance = new DeepSpeechService(serviceStore, {
				id: serviceId,
				modelName: serviceConfig.modelName,
				modelPath: serviceConfig.modelPath
			});
			
			callback(null, instance, true);
		}
	}
}

module.exports = DeepSpeechService;