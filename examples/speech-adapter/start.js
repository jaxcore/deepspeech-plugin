// import Jaxcore and create an instance
const Jaxcore = require('jaxcore');
const {Adapter} = require('jaxcore');
const jaxcore = new Jaxcore();

// import the Jaxcore Speech plugin
const SpeechPlugin = require('../../index'); // or use require('jaxcore-speech');
jaxcore.addPlugin(SpeechPlugin);

// create a custom Jaxcore adapter for handling speech
class ConsoleAdapter extends Adapter {
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		const {speech} = devices;
		
		this.addEvents(speech, {
			recognize: function (text, stats) {
				console.log('speech recognized:', text);
				
				/* YOUR CODE GOES HERE */
				
				if (text === 'hello world') {
					console.log('YOU SAID HELLO WORLD!!!');
				}
				
			}
		});
		
		// start recording continuously
		speech.startContinuous();
	}
}

// add the adapter to Jaxcore
jaxcore.addAdapter('speechconsole', ConsoleAdapter);

jaxcore.on('service-connected', function(type, service) {
	if (type === 'speech') {
		// when the speech service is ready, launch the adapter
		const speech = service;
		jaxcore.launchAdapter(speech, 'speechconsole');
	}
});

// start the speech adapter (pay attention to the deepspeech modelPath location)
jaxcore.startService('speech', null, null, {
	modelName: 'english',
	modelPath: __dirname + '/../../deepspeech-0.6.0-models'
}, function(err, speech) {
	console.log('speech service ready', typeof speech);
});