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
	// vadMode: 'VERY_AGGRESSIVE',
	vadMode: 'AGGRESSIVE',
	debug: 'true'
});

// ADAPTER

const directionReplacements = {
	'option left': 'alt left',
	'option right': 'alt down',
	'option up': 'alt up',
	'option down': 'alt down',
	'shift option left': 'option shift left|shift alt left|alt shift left',
	'shift option right': 'option shift right|shift alt right|alt shift right',
	'shift option up': 'option shift up|shift alt up|alt shift up',
	'shift option down': 'option right down|shift alt down|alt shift down',
};

const exactReplacements = {
	'three': ['the', 'there'],
	'five': ['for i\'ve'],
	'eight': ['eat', 'at'],
	'nine': ['now i\'m']
};
const numberReplacements = {
	'two': 'to',
	'four': 'for',
	'six': 'sex',
	'.': 'dot',
	'[': 'left brace',
	']': 'right brace',
	'{': 'left curly brace',
	'}': 'right curly brace',
	'(': 'left bracket',
	')': 'right bracket',
	'=': 'equals',
	'+': 'plus',
	'-': 'dash|minus',
	'*': 'times|multiplied by',
	'/': 'divide by|divided by',
	';': 'semi colon',
	':': 'colon|collin|cool and',
	',': 'comma',
	'escape': 'clear',
	'backspace': 'back space',
	'>': 'greater than',
	'<': 'less than',
};

function parseNumbers(text) {
	text = makeReplacements(text, numberReplacements);
	text = wordsToNumbers(text).toString();
	return text;
}

function makeExactReplacements(text, corrections) {
	for (let key in corrections) {
		for (let i = 0; i < corrections[key].length; i++) {
			if (text === corrections[key][i]) {
				return key;
			}
		}
	}
	return text;
}

function makeReplacements(text, corrections) {
	for (let key in corrections) {
		let r = '(?<=\\s|^)('+corrections[key]+')(?=\\s|$)';
		let regex = new RegExp(r, 'i');
		let match = regex.test(text);
		if (match) {
			text = text.replace(new RegExp(r, 'gi'), function (m, a) {
				return key;
			});
		}
	}
	return text;
}

const keywords = ['space','escape','tab','enter','return','delete','backspace','home','end','left','right','up','down'];
const commandComboWords = {
	'hold shift': {
		hold: 'shift'
	},
	'release shift': {
		release: 'shift'
	},
	'select all': {
		key: 'a',
		modifiers: ['command']
	},
	'copy': {
		key: 'c',
		modifiers: ['command']
	},
	'paste': {
		key: 'v',
		modifiers: ['command']
	},
	'shift option left': {
		key: 'left',
		modifiers: ['shift', 'alt']
	},
	'shift option right': {
		key: 'right',
		modifiers: ['shift', 'alt']
	},
	'shift option up': {
		key: 'up',
		modifiers: ['shift', 'alt']
	},
	'shift option down': {
		key: 'down',
		modifiers: ['shift', 'alt']
	},
	'shift left': {
		key: 'left',
		modifiers: ['shift']
	},
	'shift right': {
		key: 'right',
		modifiers: ['shift']
	},
	'shift up': {
		key: 'up',
		modifiers: ['shift']
	},
	'shift down': {
		key: 'down',
		modifiers: ['shift']
	},
	'option left': {
		key: 'left',
		modifiers: ['alt']
	},
	'option right': {
		key: 'right',
		modifiers: ['alt']
	},
	'option up': {
		key: 'up',
		modifiers: ['alt']
	},
	'option down': {
		key: 'down',
		modifiers: ['alt']
	},
	'command left': {
		key: 'left',
		modifiers: ['command']
	},
	'command right': {
		key: 'right',
		modifiers: ['command']
	},
	'command up': {
		key: 'up',
		modifiers: ['command']
	},
	'command down': {
		key: 'down',
		modifiers: ['command']
	},
	'control left': {
		key: 'left',
		modifiers: ['control']
	},
	'control right': {
		key: 'right',
		modifiers: ['control']
	},
	'control up': {
		key: 'up',
		modifiers: ['control']
	},
	'control down': {
		key: 'down',
		modifiers: ['control']
	}
};

function parseWord(keys, word) {
	if (keywords.indexOf(word) > -1) {
		if (word === 'return') word = 'enter';
		keys.push({
			key: word
		});
	}
	else if (/^[\d|\+|\-|\=|\/|\*|\.|,| ]+$/.test(word)) {
		word.split('').forEach(char => {
			keys.push({
				key: char
			});
		});
	}
	else if (/^[\]|\[|{|}|\(|\)|\;|\:,|<|>]+$/.test(word)) {
		word.split('').forEach(char => {
			keys.push({
				typeString: char
			});
		});
	}
}

function processComboWord(keys, combo, text) {
	while (text.indexOf(combo) > -1) {
		let index = text.indexOf(combo);
		if (index > 0) {
			let words = text.substring(0, index);
			processComboWords(keys, words);
		}
		
		keys.push(commandComboWords[combo]);
		text = text.substring(index + combo.length + 1).trim();
	}
	return text;
}

function processComboWords(keys, text) {
	for (let combo in commandComboWords) {
		text = processComboWord(keys, combo, text);
	}
	text.split(' ').forEach(word => {
		parseWord(keys, word);
	});
}

function parseKeys(text) {
	let keys = [];
	// console.log('original text ='+text);
	text = makeExactReplacements(text, exactReplacements);
	text = parseNumbers(text);
	text = makeReplacements(text, directionReplacements);
	console.log('\nProcessed text:', text);
	processComboWords(keys, text);
	console.log('Processed keys:', keys);
	return keys;
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
				this.processText(text);
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
	
	processText(text) {
		const {keyboard} = this.services;
		let modifierHold = null;
		let keys = parseKeys(text);
		keys.forEach(key => {
			if (key.key) {
				if (key.modifiers) {
					keyboard.keyPress(key.key, key.modifiers);
					this.setState({  // eg. release shift after paste
						modifierHold: null
					});
				}
				else if (modifierHold) {
					keyboard.keyPress(key.key, [modifierHold]);
				}
				else {
					keyboard.keyPress(key.key);
				}
			}
			else if (key.typeString) {
				keyboard.typeString(key.typeString);
			}
			else if (key.hold) {
				this.setState({
					modifierHold: key.hold
				});
			}
			else if (key.release) {
				this.setState({
					modifierHold: null
				});
			}
		});
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
		'Deepspeech English'
	]
});

jaxcore.connectAdapter(null, 'Number Typer');
