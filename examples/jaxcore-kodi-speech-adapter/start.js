const Jaxcore = require('jaxcore');
const {Adapter} = require('jaxcore');
const {wordsToNumbers} = require('words-to-numbers');

const jaxcore = new Jaxcore();
jaxcore.addPlugin(require('jaxcore-kodi-plugin'));
jaxcore.addPlugin(require('jaxcore-deepspeech-plugin'));

const BumbleBee = require('bumblebee-hotword-node');
const bumblebee = new BumbleBee();
bumblebee.addHotword('bumblebee');

// function numberize(text) {
// 	text = text.replace(/^to /,'two ').replace(/ to$/,' two').replace(/ to /,' two ');
// 	let nums = wordsToNumbers(text).toString();
// 	console.log('nums', nums);
// 	nums = nums.replace(/ /g,'');
// 	let num = parseInt(nums);
// 	if (isNaN(num)) return null;
// 	return num;
// }

class KodiSpeechAdapter extends Adapter {
	static getDefaultState() {
		return {
		};
	}
	
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		const {deepspeech} = devices;
		const {kodi} = services;
		
		console.log('deepspeech', deepspeech);
		
		this.addEvents(deepspeech, {
			recognize: function (text, stats) {
				this.log('speech recognize', text);
				
				if (text === 'page up') {
					console.log('page up');
					kodi.pageUp();
				}
				if (text === 'page down') {
					console.log('page down');
					kodi.pageDown();
				}
				if (text === 'up') {
					console.log('arrow up');
					kodi.up(-1);
				}
				if (text === 'down') {
					console.log('arrow down');
					kodi.down(1);
				}
				if (text === 'left') {
					console.log('arrow left');
					kodi.left(-1);
				}
				if (text === 'right') {
					console.log('arrow right');
					kodi.right(1);
				}
				if (text === 'select') {
					console.log('select');
					kodi.select();
				}
				if (text === 'pause') {
					console.log('pause');
					kodi.playPause();
				}
				if (text === 'play') {
					console.log('play');
					kodi.playPause();
				}
				if (text === 'back') {
					console.log('back');
					kodi.back();
				}
				if (text === 'stop') {
					console.log('stop');
					kodi.stop();
				}
			}
		});
	}
	
	static getServicesConfig(adapterConfig) {
		console.log('getServicesConfig', adapterConfig);
		return {
			kodi: adapterConfig.profile.services.kodi
		};
	}
}

jaxcore.addAdapter('kodi-speech', KodiSpeechAdapter);

const KODI_HOST = process.env.KODI_HOST || 'localhost';
jaxcore.defineAdapter('my-kodi-speech', {
	adapterType: 'kodi-speech',
	deviceType: 'deepspeech',
	services: {
		kodi: {
			host: KODI_HOST,
			// host: 'localhost',
			port: 9090
		}
	}
});

const MODEL_PATH = process.env.DEEPSPEECH_MODEL || __dirname + '/../../deepspeech-0.6.0-models'; // path to deepspeech model

jaxcore.startService('deepspeech', {
	modelName: 'english',
	modelPath: MODEL_PATH,
	silenceThreshold: 200, // how many milliseconds of silence before processing the audio
	vadMode: 'VERY_AGGRESSIVE', // options are: 'NORMAL', 'LOW_BITRATE', 'AGGRESSIVE', 'VERY_AGGRESSIVE'
	debug: 'true'
}, function(err, deepspeech) {
	
	bumblebee.on('data', function(data) {
		// stream microphone data to deepspeech
		deepspeech.streamData(data);
	});
	
	bumblebee.start();
	
	jaxcore.connectAdapter(deepspeech, 'my-kodi-speech');
	
});
