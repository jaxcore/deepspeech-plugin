const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();

const DeepSpeechPlugin = require('../../');
jaxcore.addPlugin(DeepSpeechPlugin);

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
	
	deepspeech.startMicrophone();
});
