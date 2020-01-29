const Jaxcore = require('jaxcore');
const Adapter = Jaxcore.Adapter;
const jaxcore = new Jaxcore();
jaxcore.addPlugin(require('jaxcore-deepspeech-plugin'));

jaxcore.addPlugin(require('bumblebee-hotword-node'));

// const BumbleBee = require('bumblebee-hotword-node');
// const bumblebee = new BumbleBee();
// bumblebee.setHotword('bumblebee');

const MODEL_PATH = process.env.DEEPSPEECH_MODEL || __dirname + '/../../deepspeech-0.6.0-models'; // path to deepspeech model

class SpeechConsoleAdapter extends Adapter {
	// static getDefaultState() {
	// 	return {
	// 	};
	// }
	//
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		
		// const {deepspeech} = services;
		const {deepspeech, bumblebeeNode} = services;
		console.log('CREATED SpeechConsoleAdapter', deepspeech);
		
		bumblebeeNode.setHotword('bumblebee');
		
		// process.exit();
		
		// const {speech} = devices;
		// const {keyboard, mouse, scroll} = services;
		
		this.addEvents(deepspeech, {
			recognize: function (text, stats) {
				this.log('SpeechConsoleAdapter recognize', text, stats);
			}
		});
		
		this.addEvents(bumblebeeNode, {
			hotword: function(hotword) {
				console.log('hotword detected', hotword);
			},
			data: function (data) {
				deepspeech.streamData(data);
			}
		});
		
	}
	
	static getServicesConfig(adapterConfig) {
		console.log('getServicesConfig', adapterConfig);
		return {
			deepspeech: adapterConfig.profile.services.deepspeech
		};
	}
}

jaxcore.addAdapter('speech-console', SpeechConsoleAdapter);

// jaxcore.defineService('DeepSpeech', {
//
// });
jaxcore.defineAdapter('Speech Console', {
	adapterType: 'speech-console',
	// deviceType: 'speech',
	services: {
		bumblebeeNode: true,
		deepspeech: {
			modelName: 'english',
			modelPath: MODEL_PATH,
			silenceThreshold: 200, // how many milliseconds of silence before processing the audio
			vadMode: 'VERY_AGGRESSIVE', // options are: 'NORMAL', 'LOW_BITRATE', 'AGGRESSIVE', 'VERY_AGGRESSIVE'
			debug: 'true'
		}
	}
});

// jaxcore.on('spin-connected', function(spin) {
// 	console.log('connected', spin.id);
//
// 	jaxcore.connectAdapter(spin, 'mouse-default');
// });
//
// jaxcore.startDevice('spin');

jaxcore.connectAdapter(null, 'Speech Console');

// jaxcore.startService('deepspeech', {
// 	modelName: 'english',
// 	modelPath: MODEL_PATH,
// 	silenceThreshold: 200, // how many milliseconds of silence before processing the audio
// 	vadMode: 'VERY_AGGRESSIVE', // options are: 'NORMAL', 'LOW_BITRATE', 'AGGRESSIVE', 'VERY_AGGRESSIVE'
// 	debug: 'true'
// }, function(err, deepspeech) {
//
// 	deepspeech.on('recognize', function(text) {
// 		console.log('recognize', text);
// 	});
//
// 	bumblebee.on('data', function(data) {
// 		// stream microphone data to deepspeech
// 		deepspeech.streamData(data);
// 	});
//
// 	// bumblebee start the microphone
// 	bumblebee.start();
//
//
// 	jaxcore.connectAdapter(null, 'Speech Console');
// });
