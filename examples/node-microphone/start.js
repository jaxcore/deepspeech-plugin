const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();
jaxcore.addPlugin(require('jaxcore-deepspeech-plugin'));

const BumbleBee = require('bumblebee-hotword-node');
const bumblebee = new BumbleBee();
bumblebee.addHotword('bumblebee');

const MODEL_PATH = __dirname + '/../../deepspeech-0.6.0-models'; // path to deepspeech model

jaxcore.startService('deepspeech', {
	modelName: 'english',
	modelPath: MODEL_PATH,
	silenceThreshold: 200, // how many milliseconds of silence before processing the audio
	vadMode: 'VERY_AGGRESSIVE', // options are: 'NORMAL', 'LOW_BITRATE', 'AGGRESSIVE', 'VERY_AGGRESSIVE'
}, function(err, deepspeech) {
	
	deepspeech.on('recognize', (text, stats) => {
		console.log('recognize:', text, stats);
	});
	
	bumblebee.on('data', function(data) {
		// stream microphone data to deepspeech
		deepspeech.streamData(data);
	});
	
	// bumblebee start the microphone
	bumblebee.start();
});
