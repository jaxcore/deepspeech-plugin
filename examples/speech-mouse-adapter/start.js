const Jaxcore = require('jaxcore');
const {Adapter} = require('jaxcore');
const SpeechPlugin = require('../../index');

const jaxcore = new Jaxcore();
jaxcore.addPlugin(SpeechPlugin);
jaxcore.addPlugin(require('jaxcore/plugins/keyboard'));
jaxcore.addPlugin(require('jaxcore/plugins/mouse'));
jaxcore.addPlugin(require('jaxcore/plugins/scroll'));

const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});

class SpeechMouseAdapter extends Adapter {
	static getDefaultState() {
		return {
		};
	}
	
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		const {speech} = devices;
		const {mouse, keyboard, scroll} = services;
		
		this.addEvents(speech, {
			recognize: function (text, stats) {
				this.log('speech recognize', text, stats);
			},
			start: function() {
				this.log('on start');
			},
			stop: function(stats) {
				this.log('on stop', stats);
			}
		});
		
		// console.log('in 7.....');
		// setTimeout(function() {
		// 	speech.startContinuous();
		// }, 2000);
		
		process.stdin.resume();
		
		this.startConsoleLoop();
		
	}
	
	startConsoleLoop() {
		const {speech} = this.devices;
		
		readline.question('\nPress ENTER to start recording.\n', () => {
			
			readline.question('Press ENTER to stop.\n', (name) => {
				speech.stop();
				console.log('Stopped recording.');
				this.startConsoleLoop();
			});
			
			speech.start();
		});
	}
	
	static getServicesConfig(adapterConfig) {
		console.log('getServicesConfig', adapterConfig);
		// process.exit();
		return {
			keyboard: true,
			mouse: true,
			scroll: true
		};
	}
}

jaxcore.addAdapter('speech-mouse', SpeechMouseAdapter);

jaxcore.on('service-connected', function(type, service) {
	if (type === 'speech') {
		jaxcore.launchAdapter(service, 'speech-mouse');
	}
});

jaxcore.startService('speech', null, null, {
	modelName: 'english',
	modelPath: __dirname + '/../../deepspeech-0.6.0-models'
}, function(err, speech) {
	console.log('speech service');
	// process.exit();
});