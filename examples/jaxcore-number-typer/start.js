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
const numberReplacements = {
	'two': 'to',
	'four': 'for',
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
	// text = text.replace(/ /g,'');
	// text = text.replace(/space/g,' ');
	return text;
}

function makeReplacements(text, corrections) {
	// make corrections using string substitutions
	for (let key in corrections) {
		let r = '(?<=\\s|^)('+corrections[key]+')(?=\\s|$)';
		// console.log('key', key, r);
		let regex = new RegExp(r, 'i');
		let match = regex.test(text);
		if (match) {
			text = text.replace(new RegExp(r, 'gi'), function (m, a) {
				// console.log(m);
				return key;
			});
		}
	}
	return text;
}

// console.log(parseNumbers('zero one space to dash three dot four five point six', numberCorrections));
// console.log(parseNumbers('one divided by for equals three point six left curly brace', numberCorrections));
// console.log(wordsToNumbers('three point six', numberCorrections));

// let txt = parseNumbers('one plus to comma times four divided by three equals');
// console.log(txt);
// txt.split(' ').forEach(word => {
// 	if (/^[\d|\+|-|\=|\/|\*|\.|,| ]+$/.test(word)) {
// 		console.log('keyPress', word);
// 	}
// 	// else if () {
// 	//
// 	// }
// 	// else if (/\]|\[|{|}|\(|\)|\;|,/.test(char)) {
// 	// 	keyboard.typeString(char);
// 	// }
// });

/*
let keys = parseKeys('one to three shift left shift left shift left copy right enter paste enter for five six space plus space twelve space equals left brace backspace space four hundred sixty eight semi colon option shift left option shift left copy right enter paste select all copy right enter paste');
123
123
456 + 12 = 468;
468;
123
123
456 + 12 = 468;
468;
*/

/*
 let keys = parseKeys('one to three hold shift left left left release shift copy right paste');
 123123
 */

const keywords = ['space','escape','tab','enter','return','delete','backspace','home','end','left','right','up','down'];
const modifierWords = ['shift','control','option','command'];
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
			// console.log('keyPress', char);
			// keyboard.keyPress(char);
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
			//keyboard.typeString(char);
		});
	}
}

function processComboWord(keys, combo, text) {
	// if (text.indexOf(combo) > -1) {
	while (text.indexOf(combo) > -1) {
		let index = text.indexOf(combo);
		console.log('found combo (', combo,') at', index);
		if (index > 0) {
			
			let words = text.substring(0, index);
			
			console.log('words before combo='+words);
			console.log('words after combo='+text.substring(index + combo.length + 1).trim());
			
			processComboWords(keys, words);
			
			// let beforecombotext = processComboWords(keys, words);
			// beforecombotext.split(' ').forEach(word => {
			// 	parseWord(keys, word);
			// });
		}
		keys.push(commandComboWords[combo]);
		
		text = text.substring(index + combo.length + 1).trim();
		
		console.log('text now='+text);
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
	
	// return text;
}

function parseKeys(text) {
	let keys = [];
	console.log('original text ='+text);
	text = parseNumbers(text);
	text = makeReplacements(text, directionReplacements);
	console.log('replaced text ='+text);
	
	// while(text.length) {
	// 	text = processComboWords(keys, text);
	// }
	
	processComboWords(keys, text);
	
	// console.log('leftover text=', text);
	
	// text.split(' ').forEach(word => {
	// 	parseWord(keys, word);
	// });
	return keys;
}

// let keys = parseKeys('one space to select all delete five option right nine greater than semi colon');
// let keys = parseKeys('one space to back space five dot dash nine greater than semi colon select all copy right enter paste shift option left shift option left shift option left');
// let keys = parseKeys('one to three for shift option left shift option left shift option left');
// let keys = parseKeys('one option shift right two option shift right three option shift right');
// let keys = parseKeys('one to three for shift left shift left shift left copy left paste left left enter option shift right copy');
// let keys = parseKeys('one to three shift left shift left shift left one shift left copy semi colon twelve');
// let keys = parseKeys('enter option shift right copy');

// console.log(keys);
// process.exit();

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
		
		// setTimeout(function() {
		//
		// 	// let txt = parseNumbers('less than dash semi colon minus greater than colon twelve plus to space comma times four divided by three equals');
		// 	// let txt = parseNumbers('for dash three dash equals');
		// 	// console.log(txt);
		//
		// 	// let keys = parseKeys('one space to select all delete five option right nine greater than semi colon');
		// 	// let keys = parseKeys('one space to back space five dot dash nine greater than semi colon select all copy right enter paste shift option left shift option left shift option left');
		// 	// let keys = parseKeys('one to three for shift left shift left shift left copy left paste left left enter option shift right copy');
		// 	// let keys = parseKeys('one to three shift left shift left shift left copy right enter paste enter for five six space plus space twelve space equals left brace backspace space four hundred sixty eight semi colon option shift left option shift left copy right enter paste select all copy right enter paste shift option up');
		//
		// 	let keys = parseKeys('one to three hold shift left left left release shift copy right paste');
		//
		// 	let modifierHold = null;
		//
		// 	keys.forEach(key => {
		// 		if (key.key) {
		// 			if (key.modifiers) {
		// 				keyboard.keyPress(key.key, key.modifiers);
		// 				modifierHold = null;  // eg. release shift after paste
		// 			}
		// 			else if (modifierHold) {
		// 				keyboard.keyPress(key.key, [modifierHold]);
		// 			}
		// 			else {
		// 				keyboard.keyPress(key.key);
		// 			}
		// 		}
		// 		else if (key.typeString) {
		// 			keyboard.typeString(key.typeString);
		// 		}
		// 		else if (key.hold) {
		// 			modifierHold = key.hold;
		// 		}
		// 		else if (key.release) {
		// 			modifierHold = null;
		// 		}
		// 	});
		//
		// 	// commandComboWords.indexOf(word) > -1) {
		// 	// 	keyboard.keyPress(word);
		// 	// }
		//
		// 	// txt.split(' ').forEach(word => {
		// 	// 	if (/^[\d|\+|\-|\=|\/|\*|\.|,| ]+$/.test(word)) {
		// 	// 		word.split('').forEach(char => {
		// 	// 			console.log('keyPress', char);
		// 	// 			keyboard.keyPress(char);
		// 	// 		});
		// 	// 	}
		// 	// 	else if (keywords.indexOf(word) > -1) {
		// 	// 		keyboard.keyPress(word);
		// 	// 	}
		// 	//
		// 	// 	else {
		// 	// 		if (/^[\]|\[|{|}|\(|\)|\;|\:,|<|>]+$/.test(word)) {
		// 	// 			word.split('').forEach(char => {
		// 	// 				keyboard.typeString(char);
		// 	// 			});
		// 	// 		}
		// 	// 	}
		// 	// });
		// 	process.exit();
		//
		// // keyboard.keyPress('4');
		// // keyboard.keyPress('*');
		// // keyboard.keyPress('4');
		// // keyboard.keyPress('=');
		// // keyboard.keyPress('+');
		// // keyboard.keyPress('2');
		// // keyboard.keyPress('=');
		//
		// // keyboard.keyPress('+');
		// // keyboard.keyPress('-');
		// // keyboard.keyPress('=');
		// // keyboard.keyPress('/');
		// // keyboard.keyPress('*');
		// // keyboard.keyPress('.');
		// // keyboard.keyPress(']');
		// // keyboard.keyPress('[');
		// // keyboard.keyPress(';');
		// // keyboard.keyPress(',');
		//
		// // keyboard.typeString(':');
		// // keyboard.typeString('{');
		// // keyboard.typeString('}');
		// // keyboard.typeString('(');
		// // keyboard.typeString(')');
		//
		// // process.exit();
		// }, 2000);
		
		
		bumblebeeNode.setHotword('bumblebee');
		
		this.addEvents(deepspeech, {
			recognize: function(text, stats) {
				console.log('Recognized:', text, stats);
				this.processText(text);
				
				// let processedText = parseNumbers(text);
				// // this.say(text);
				// console.log('input:', text);
				// console.log('processedText:', processedText);
				//
				// processedText.split('').forEach(char => {
				// 	if (/\d|\+|-|\=|\/|\*|\.| /.test(char)) {
				// 		keyboard.keyPress(char);
				// 	}
				// 	else if (/\]|\[|{|}|\(|\)|\;|,/.test(char)) {
				// 		keyboard.typeString(char);
				// 	}
				// })
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
