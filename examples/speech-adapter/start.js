const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();

const SpeechPlugin = require('../../index');
jaxcore.addPlugin(SpeechPlugin);

jaxcore.addAdapter('speechconsole', require('./speechconsole-adapter'));

// jaxcore.on('spin-connected', function(spin) {
// 	jaxcore.launchAdapter(spin, 'basic');
// });
//
// jaxcore.startDevice('spin');

jaxcore.on('service-connected', function(type, service) {
	if (type === 'speech') {
		const speech = service;
		jaxcore.launchAdapter(speech, 'speechconsole');
	}
	else {
		console.log('other', type);
	}
});

jaxcore.startService('speech', null, null, {
	models: {
		english: {
			// path: __dirname + '/../../deepspeech-0.5.1-models'
			path: __dirname + '/../../deepspeech-0.6.0-models'
		}
	}
}, function(err, speech) {
	console.log('speech service', typeof speech);
});