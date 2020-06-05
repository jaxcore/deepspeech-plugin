const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();

// PLUGINS

jaxcore.addPlugin(require('bumblebee-hotword-node'));
jaxcore.addPlugin(require('jaxcore-deepspeech-plugin'));

// SERVICES

jaxcore.defineService('Bumblebee Node', 'bumblebeeNode', {});

jaxcore.defineService('Deepspeech English', 'deepspeech', {
	modelName: 'english',
	modelPath: process.env.DEEPSPEECH_MODEL || __dirname + '/../../deepspeech-0.7.0-models', // path to deepspeech model
	silenceThreshold: 200,
	vadMode: 'VERY_AGGRESSIVE',
	debug: true
});

// ADAPTER

class BumblebeeDeepspeechAdapter extends Jaxcore.Adapter {
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		
		const {deepspeech, bumblebeeNode} = services;
		
		bumblebeeNode.setHotword('bumblebee');
		
		this.addEvents(deepspeech, {
			recognize: function(text, stats) {
				console.log('Recognized:', text, stats);
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
		
		// setTimeout(() => {
		// 	deepspeech.destroy();
		// }, 10000);
	}
}

jaxcore.addAdapter('bumblebee-deepspeech-adapter', BumblebeeDeepspeechAdapter);

// CONNECT THE "bumblebee-deepspeech-adapter" ADAPTER TO THE "Bumblebee Node" AND "Deepspeech English" SERVICES

jaxcore.defineAdapter('BumbleBee Deepspeech', {
	adapterType: 'bumblebee-deepspeech-adapter',
	serviceProfiles: [
		'Bumblebee Node',
		'Deepspeech English'
	]
});

jaxcore.connectAdapter(null, 'BumbleBee Deepspeech');
