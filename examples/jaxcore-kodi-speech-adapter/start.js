const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();

// PLUGINS

jaxcore.addPlugin(require('jaxcore-kodi-plugin'));
jaxcore.addPlugin(require('bumblebee-hotword-node'));
jaxcore.addPlugin(require('jaxcore-deepspeech-plugin'));

// SERVICES

jaxcore.defineService('Bumblebee Node', 'bumblebeeNode', {});
jaxcore.defineService('Deepspeech English', 'deepspeech', {
	modelName: 'english',
	modelPath: process.env.DEEPSPEECH_MODEL || __dirname + '/../../deepspeech-0.6.0-models', // path to deepspeech model
	silenceThreshold: 200,
	vadMode: 'VERY_AGGRESSIVE',
	debug: 'true'
});
jaxcore.defineService('Kodi', 'deepspeech', {
	host: process.env.KODI_HOST || 'localhost',
	port: 9090
});

// ADAPTER

class KodiSpeechAdapter extends Jaxcore.Adapter {
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		const {kodi, deepspeech, bumblebeeNode} = services;
		
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
		
		this.addEvents(bumblebeeNode, {
			hotword: function(hotword) {
				console.log('\n[hotword detected:', hotword, ']');
			},
			data: function (data) {
				deepspeech.streamData(data);
			}
		});
		
		bumblebeeNode.start();
	}
}

jaxcore.addAdapter('kodi-speech', KodiSpeechAdapter);

// CONNECT THE "kodi-speech" ADAPTER TO THE SERVICES

jaxcore.defineAdapter('Kodi Speech', {
	adapterType: 'kodi-speech',
	serviceProfiles: [
		'Bumblebee Node',
		'Deepspeech English',
		'Kodi'
	]
});

jaxcore.connectAdapter(null, 'Kodi Speech');
