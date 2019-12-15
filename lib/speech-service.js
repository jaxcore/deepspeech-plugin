const {Service, createLogger} = require('jaxcore');

const fork = require('child_process').fork;

const childProcessPath = __dirname + '/speech-service-child.js';

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
	recordingMode: {
		type: 'string'
	}
};

let _instance = 0;

const speechInstances = {};

class SpeechService extends Service {
	constructor(store, defaults) {
		super(schema, store, defaults);
		
		this.log = createLogger('Speech Process' + (_instance++));
		this.log('create', defaults);
		
		let proc = fork(
			childProcessPath,
			['--model-path', this.state.modelPath, '--model-name', this.state.modelName],
			// ['--key', 'value'], // pass to process.argv into child
			{
				// stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ]
			}
		);
		
		proc.on('exit', (code, sig) => {
			console.log('speech process exit', code);
			process.exit();
		});
		
		proc.on('error', (error) => {
			console.log('speech process error', error);
			process.exit();
		});
		
		proc.on('message',(data) => {
			console.log('message from proc', data);
			// process.exit();
			
			if (data === true) {
				this._connected();
			}
			else if (typeof data === 'object') {
				if ('recognize' in data) {
					if (data.recognize.text && data.recognize.stats) {
						console.log('got recognize', data);
						this.emit('recognize', data.recognize.text, data.recognize.stats);
					}
				}
				if ('start' in data) {
					console.log('start');
				}
			}
		});
		
		let count = 0;
		setInterval(function() {
			count++;
			proc.send('main '+count, function() {
				console.log('main sent', count);
			});
		},1000);
		
		this.proc = proc;
		
		speechInstances[this.id] = this;
	}
	
	start() {}
	stop() {}
	
	startContinuous() {}
	stopContinuous() {}
	
	startUtterance() {} // starts continuous and stops after the first recognition
	
	cancel() {}
	
	
	_connected() {
		this.setState({
			connected: true
		});
		this.emit('connect');
	}
	
	static id(serviceConfig) {
		return 'speech:'+serviceConfig.modelName;
	}
	
	static getOrCreateInstance(serviceStore, serviceId, serviceConfig, callback) {
		if (speechInstances[serviceId]) {
			let instance = speechInstances[serviceId];
			instance.log('RETURNING SPEECH CLIENT', instance);
			// process.exit();
			callback(null, instance);
		}
		else {
			console.log('CREATE SPEECH', serviceId, serviceConfig);
			
			let instance = new SpeechService(serviceStore, {
				id: serviceId,
				modelName: serviceConfig.modelName,
				modelPath: serviceConfig.modelPath
			});
			
			callback(null, instance);
		}
	}
}

module.exports = SpeechService;