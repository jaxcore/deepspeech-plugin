const DeepSpeechPlugin = require('jaxcore-deepspeech-plugin');
const BumbleBeeNode = require('bumblebee-hotword-node');

const bumblebee = new BumbleBeeNode();
bumblebee.setHotword('bumblebee');

DeepSpeechPlugin.start({
	modelName: 'english',
	modelPath: process.env.DEEPSPEECH_MODEL || __dirname + '/../../deepspeech-0.6.0-models', // path to deepspeech model,
	silenceThreshold: 200, // delay for this long before processing the audio
	vadMode: 'VERY_AGGRESSIVE', // options are: 'NORMAL', 'LOW_BITRATE', 'AGGRESSIVE', 'VERY_AGGRESSIVE'
	debug: true
})
.then(deepspeech => {
	// receive the speech recognition results
	deepspeech.on('recognize', (text, stats) => {
		console.log('\nrecognize:', text, stats);
	});
	
	// bumblebee emits a "data" event for every 8192 bytes of audio it records from the microphone
	bumblebee.on('data', function(data) {
		// stream the data to the deepspeech plugin
		deepspeech.streamData(data);
	});

	// bumblebee start the microphone
	bumblebee.start();
})
.catch(console.error);