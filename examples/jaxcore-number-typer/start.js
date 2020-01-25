const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();

const {wordsToNumbers} = require('words-to-numbers');

// PLUGINS

jaxcore.addPlugin(require('jaxcore/plugins/keyboard'));
jaxcore.addPlugin(require('bumblebee-hotword-node'));
jaxcore.addPlugin(require('jaxcore-deepspeech-plugin'));
jaxcore.addPlugin(require('jaxcore-say-node'));

// this is a hack to make sure this all works on Mac OSX
// tell sayNode to use the speaker module we've installed using `npm install speaker --mpg123-backend=openal --no-save`
require('jaxcore-say-node').speaker = require('speaker');

// SERVICES
jaxcore.defineService('Keyboard', 'keyboard', {});
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

function parseNumbers(text) {
	text = text.replace(/^to /,'two ').replace(/ to$/,' two').replace(/ to /,' two ');
	let nums = wordsToNumbers(text).toString();
	//console.log('nums', nums);
	// nums = nums.replace(/ /g,'');
	return nums;
	/*let num = parseInt(nums);
	if (isNaN(num)) return null;
	return num;*/
}

class JaxcoreNumberTyper extends Jaxcore.Adapter {
	static getDefaultState() {
		return {
			speechRecognitionActive: false,
			sayActive: false
		};
	}
	
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		
		const {keyboard, sayNode, deepspeech, bumblebeeNode} = services;
		
		bumblebeeNode.setHotword('bumblebee');
		
		this.addEvents(deepspeech, {
			recognize: function(text, stats) {
				console.log('Recognized:', text, stats);
				let processedText = parseNumbers(text);
				// this.say(text);
				console.log('input:', text);
				console.log('processedText:', processedText);
			}
		});
		
		this.addEvents(bumblebeeNode, {
			start: function() {
				setTimeout(() => {
					console.log('\nTo start Number Typer, just say: BUMBLEBEE');
					this.say('To start Number Typer, just say... bumble bee');
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
		
		
		// setTimeout(() => {
		// 	deepspeech.destroy();
		// }, 10000);
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
		console.log('\nStart Number Typer by saying: BUMBLEBEE');
		console.log('Number Typer disabled');
		this.setState({
			speechRecognitionActive: false
		});
		this.say("Number Typer disabled");
	}
	
	startRecognition() {
		console.log('Stop Number Typer by saying: BUMBLEBEE');
		console.log('Number Typer enabled');
		this.say("Number Typer enabled").then(() => {
			this.setState({
				speechRecognitionActive: true
			});
		});
	}
}

jaxcore.addAdapter('jaxcore-number-typer', JaxcoreNumberTyper);

// CONNECT THE "voice-assistant-toolbox" ADAPTER TO THE SERVICES

jaxcore.defineAdapter('Number Typer', {
	adapterType: 'jaxcore-number-typer',
	serviceProfiles: [
		'Keyboard',
		'Say Node',
		'Bumblebee Node',
		'Deepspeech English',
		'Keyboard'
	]
});

jaxcore.connectAdapter(null, 'Number Typer');
