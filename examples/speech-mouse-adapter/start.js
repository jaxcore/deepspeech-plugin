const Jaxcore = require('jaxcore');
const {Adapter} = require('jaxcore');
const SpeechPlugin = require('../../index');

const jaxcore = new Jaxcore();
jaxcore.addPlugin(SpeechPlugin);
jaxcore.addPlugin(require('jaxcore/plugins/keyboard'));
jaxcore.addPlugin(require('jaxcore/plugins/mouse'));

class SpeechMouseAdapter extends Adapter {
	static getDefaultState() {
		return {
		};
	}
	
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		const {speech} = devices;
		const {mouse, keyboard} = services;
		
		console.log('mouse', mouse);
		console.log('keyboard', keyboard);
		
		// spin.rainbow(2);
		// spin.lightsOff();
		
		this.addEvents(speech, {
			recognize: function (text, stats) {
				console.log('speech recognize', text);
			}
		});
		
		console.log('in 7.....');
		setTimeout(function() {
			speech.startContinuous();
		}, 7000);
	}
	
	static getServicesConfig(adapterConfig) {
		console.log('getServicesConfig', adapterConfig);
		console.log('getServicesConfig', adapterConfig);
		// process.exit();
		return {
			keyboard: true,
			mouse: true
		};
	}
}

jaxcore.addAdapter('speech-mouse', SpeechMouseAdapter);

jaxcore.on('service-connected', function(type, service) {
	console.log('got service');
	console.log('got service');
	console.log('got service');
	console.log('got service');
	console.log('got service');
	console.log('got service');
	console.log('got service');
	console.log('got service');
	console.log('got service');
	console.log('got service');
	console.log('got service');
	// process.exit();
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