// import Jaxcore and create an instance
const Jaxcore = require('jaxcore');
const {Adapter} = require('jaxcore');
const jaxcore = new Jaxcore();

// import the Jaxcore Speech plugin
const SpeechPlugin = require('../../index'); // or use require('jaxcore-speech');
jaxcore.addPlugin(SpeechPlugin);

// import spawn to call "say" command line on MacOSX
const {spawn, spawnSync} = require('child_process');

function say(text, sync) {
	if (process.platform === 'darwin') {
		if (sync) spawnSync('say', [JSON.stringify(text)]);
		else spawn('say', [JSON.stringify(text)]);
	}
}

// create a custom Jaxcore adapter for handling speech
class HelloWorldAdapter extends Adapter {
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		const {speech} = devices;
		
		this.addEvents(speech, {
			recognize: function (text, stats) {
				console.log('speech recognized:', text);
				
				/* YOUR CODE GOES HERE */
				
				if (text === 'hello world') {
					console.log('YOU SAID HELLO WORLD!!!');
					
					// stop recording before using speech synthesis
					speech.stopContinuous();
					
					// use speech synthesis to respond
					say('hello world');
					
					// wait 2 seconds to let "say" complete before turning on continuous recording
					setTimeout(function() {
						speech.startContinuous();
					},1500);
				}
				
			}
		});
		
		// start recording continuously
		say('recording is now on', true);
		speech.startContinuous();
	}
}

// add the adapter to Jaxcore
jaxcore.addAdapter('helloworld', HelloWorldAdapter);

jaxcore.on('service-connected', function(type, service) {
	if (type === 'speech') {
		// when the speech service is ready, launch the adapter
		const speech = service;
		jaxcore.launchAdapter(speech, 'helloworld');
	}
});

// start the speech adapter (pay attention to the deepspeech modelPath location)
jaxcore.startService('speech', null, null, {
	modelName: 'english',
	modelPath: __dirname + '/../../deepspeech-0.6.0-models'
}, function(err, speech) {
	console.log('speech service ready', typeof speech);
});