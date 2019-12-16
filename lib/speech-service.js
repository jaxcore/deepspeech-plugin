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
		
		this.log = createLogger('SpeechService:' + (_instance++));
		this.log('create', defaults);
		
		this.serviceType = 'speech';
		
		
		
		speechInstances[this.id] = this;
	}
	
	start() {
		this.proc.send('start');
	}
	stop() {
		this.proc.send('stop');
	}
	
	startContinuous() {
		this.proc.send('start-continuous');
	}
	stopContinuous() {
		this.proc.send('stop-continuous');
	}
	
	startUtterance() {} // starts continuous and stops after the first recognition
	
	cancel() {
		this.proc.send('cancel');
	}
	
	_connected() {
		console.log('speech process connected');
		this.setState({
			connected: true
		});
		this.emit('connect');
	}
	
	connect() {
		console.log('connect()');
		
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
			
			// process.exit();
			
			if (data === true) {
				
				this._connected();
			}
			else if (typeof data === 'object') {
				if ('recognize' in data) {
					if (data.recognize.text && data.recognize.stats) {
						console.log('emit recognize', data.recognize.text, data.recognize.stats);
						this.emit('recognize', data.recognize.text, data.recognize.stats);
					}
				}
				else if ('cancel' in data) {
					console.log('on cancel', data);
					this.emit('cancel', data.start);
				}
				else if ('start' in data) {
					console.log('on start', data);
					this.emit('start', data.start);
				}
				else if ('stop' in data) {
					console.log('on stop', data);
					this.emit('stop', data.stop);
				}
				else if ('continuousStart' in data) {
					console.log('on start', data);
					this.emit('start-continuous', data.continuousStart);
				}
				else if ('continuousStop' in data) {
					console.log('on stop-continuous', data);
					this.emit('stop-continuous', data.continuousStart);
				}
				else {
					console.log('message from proc', data);
				}
			}
		});
		
		process.on('exit', () => {
			this.log("killing speech proc");
			proc.kill();
		});
		
		// let count = 0;
		// setInterval(function() {
		// 	count++;
		// 	proc.send('main '+count, function() {
		// 		console.log('main sent', count);
		// 	});
		// },1000);
		
		this.proc = proc;
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
			
			callback(null, instance, true);
		}
	}
}

module.exports = SpeechService;