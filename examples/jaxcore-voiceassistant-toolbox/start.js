const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();

// PLUGINS

jaxcore.addPlugin(require('bumblebee-hotword-node'));
jaxcore.addPlugin(require('jaxcore-deepspeech-plugin'));
jaxcore.addPlugin(require('jaxcore-say-node'));

// SERVICES

jaxcore.defineService('Say Node', 'sayNode', {});
jaxcore.defineService('Bumblebee Node', 'bumblebeeNode', {});
jaxcore.defineService('Deepspeech English', 'deepspeech', {
	modelName: 'english',
	modelPath: process.env.DEEPSPEECH_MODEL || __dirname + '/../../deepspeech-0.6.0-models', // path to deepspeech model
	silenceThreshold: 200,
	vadMode: 'VERY_AGGRESSIVE',
	debug: 'true'
});

// ADAPTER

class VoiceAssistantToolbox extends Jaxcore.Adapter {
	static getDefaultState() {
		return {
			speechRecognitionActive: false,
			sayActive: false
		};
	}
	
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		
		const {sayNode, deepspeech, bumblebeeNode} = services;
		
		bumblebeeNode.setHotword('bumblebee');
		
		this.addEvents(deepspeech, {
			recognize: function(text, stats) {
				console.log('Recognized:', text, stats);
				this.say(text);
			}
		});
		
		this.addEvents(bumblebeeNode, {
			start: function() {
				setTimeout(() => {
					console.log('\nTo begin, just say: BUMBLEBEE');
					this.say('To begin, just say... bumble bee');
				},10);
			},
			hotword: function(hotword) {
				console.log('\nHotword Detected:', hotword);
				if (this.state.speechRecognitionActive) {
					this.stopRecognition();
				}
				else if (!this.state.speechRecognitionActive) {
					this.startRecognition();
				}
				deepspeech.streamReset(); // reset to ignore speech recognition of the hotword that was spoken
			},
			data: function (data) {
				if (this.state.speechRecognitionActive && !this.state.sayActive) {
					deepspeech.streamData(data);
				}
				else {
					process.stdout.write('_');
				}
			}
		});
		
		bumblebeeNode.start();
	}
	
	say(text) {
		const {sayNode, deepspeech} = this.services;
		this.setState({sayActive: true});  // disable recognition while using text-to-speech
		return new Promise((resolve, reject) => {
			sayNode.say(text).then(() => {
				// delay a bit and reset the deepspeech buffer before re-enabling recognition
				setTimeout(() => {
					deepspeech.streamReset();
					this.setState({sayActive: false});
					resolve();
				},200);
			});
		})
	}
	
	stopRecognition() {
		console.log('\nStart speech recognition by saying: BUMBLEBEE');
		console.log('Speech recognition disabled');
		this.setState({
			speechRecognitionActive: false
		});
		this.say("speech recognition disabled");
	}
	
	startRecognition() {
		console.log('Stop speech recognition by saying: BUMBLEBEE');
		console.log('Speech recognition enabled');
		this.say("speech recognition enabled").then(() => {
			this.setState({
				speechRecognitionActive: true
			});
		});
	}
}

jaxcore.addAdapter('voice-assistant-toolbox', VoiceAssistantToolbox);

// CONNECT THE "voice-assistant-toolbox" ADAPTER TO THE SERVICES

jaxcore.defineAdapter('Voice Assistant Toolbox', {
	adapterType: 'voice-assistant-toolbox',
	serviceProfiles: [
		'Bumblebee Node',
		'Deepspeech English',
		'Say Node'
	]
});

jaxcore.connectAdapter(null, 'Voice Assistant Toolbox');
