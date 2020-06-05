import React, {Component} from 'react';

const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();
jaxcore.addPlugin(require('jaxcore-websocket-plugin/websocket-client'));
jaxcore.addPlugin(require('jaxcore-websocket-plugin/browser-service'));

const keys = {
	'escape': {
		words: 'escape',
		display: 'esc'
	},
	'f10': {
		words: 'function ten|unction ten|eff ten',
		display: 'F10'
	},
	'f11': {
		words: 'function eleven|unction eleven|eff eleven',
		display: 'F11'
	},
	'f12': {
		words: 'function twelve|unction twelve|eff twelve',
		display: 'F12'
	},
	
	///
	
	'backtick': {
		display: '`',
		words: 'back tick',
		shiftKey: {
			key: 'tilde',
			display: '~',
			words: 'tilde|tilda||till the|till a',
		},
	},
	'1': {
		words: 'one',
		shiftKey: {
			key: 'exclamation-mark',
			display: '!',
			words: 'exclamation mark|exclamation|bang|nation mark'
		}
	},
	'2': {
		words: 'two|to',
		shiftKey: {
			key: 'at',
			display: '@',
			words: 'at'
		}
	},
	'3': {
		words: 'three',
		shiftKey: {
			key: 'number-sign',
			display: '#',
			words: 'hash|pound|number sign'
		}
	},
	'4': {
		words: 'four|for',
		shiftKey: {
			key: 'dollars',
			display: '$',
			words: 'dollar sign|dollar|dollars'
		}
	},
	'5': {
		words: 'five',
		shiftKey: {
			key: 'percent',
			display: '%',
			words: 'per cent|per centage|percent|percentage|percent sign|percentage sign|modulus|he sent'
		}
	},
	'6': {
		words: 'six|sex',
		shiftKey: {
			key: 'caret',
			display: '^',
			words: 'carrot|accent|caret'
		}
	},
	'7': {
		words: 'seven',
		shiftKey: {
			key: 'ampersand',
			display: '&',
			words: 'ampersand'
		}
	},
	'8': {
		words: 'eight',
		shiftKey: {
			key: 'asterisk',
			display: '*',
			words: 'star|asterisk|times|time|multiply|multiply by|multiplied by'
		}
	},
	'9': {
		words: 'nine',
		shiftKey: {
			key: 'left-bracket',
			display: '(',
			words: 'left bracket'
		}
	},
	'0': {
		words: 'zero',
		shiftKey: {
			key: 'right-bracket',
			display: ')',
			words: 'right bracket'
		}
	},
	'minus': {
		display: '-',
		words: 'minus|mines|dash|negative|subtract|subtracked by',
		shiftKey: {
			key: 'underscore',
			display: '_',
			words: 'underscore|under score'
		}
	},
	'equals': {
		display: '=',
		words: 'equals|equal',
		shiftKey: {
			key: 'plus',
			display: '+',
			words: 'plus|add|positive'
		}
	},
	'backspace': {
		words: 'back space|back face|back skates|back pace|back base|back stays|backstays|max face',
		display: 'back space'
	},
	
	'insert': {
		display: 'insert',
		words: 'insert'
	},
	'home': {
		display: 'home',
		words: 'home'
	},
	'pageup': {
		display: 'pgup',
		words: 'page up'
	},
	
	//
	'tab': {
		words: 'tab|tom|tad'
	},
	'q': {
		words: 'cue|queue'
	},
	'w': {
		words: 'double you'
	},
	'e': {
		words: 'eh'
	},
	'r': {
		words: 'are'
	},
	't': {
		words: 'tea'
	},
	'y': {
		words: 'why'
	},
	'u': {
		words: 'you'
	},
	'i': {
		words: 'eye'
	},
	'o': {
		words: 'oh'
	},
	'p': {
		words: 'pea|pee'
	},
	'left-brace': {
		display: '[',
		words: 'left brace',
		shiftKey: {
			key: 'left-curly-bracket',
			display: '{',
			words: 'left curly brace|left curly bracket'
		}
	},
	'right-brace': {
		display: ']',
		words: 'right brace',
		shiftKey: {
			key: 'right-curly-bracket',
			display: '}',
			words: 'right curly brace|right curly bracket'
		}
	},
	'backslash': {
		display: '\\',
		words: 'back slash|backslash',
		shiftKey: {
			key: 'vertical-bar',
			display: '|',
			words: 'pipe|vertical bar|bar'
		}
	},
	'delete': {
		words: 'delete'
	},
	'end': {
		words: 'end'
	},
	'pagedown': {
		display: 'pgdn',
		words: 'page down'
	},
	
	///
	
	'capslock': {
		display: 'caps lock',
		words: 'caps lock'
	},
	'a': {
		words: 'ah'
	},
	's': {
		words: 'es|as'
	},
	'd': {
		words: 'de'
	},
	'f': {
		words: 'eff'
	},
	'g': {
		words: 'gee'
	},
	'h': {
		words: 'ach|each|aged|age'
	},
	'j': {
		words: 'jay|gay'
	},
	'k': {
		words: 'kay'
	},
	'l': {
		words: 'el'
	},
	'semi-colon': {
		display: ';',
		words: 'semi colon|semi collin|semi colin',
		shiftKey: {
			key: 'colon',
			display: ':',
			words: 'colon|collin|colin|cool and|coal and|call and',
		}
	},
	'quote': {
		display: '\'',
		words: 'quote|apostrophe',
		shiftKey: {
			key: 'double-quote',
			display: '"',
			words: 'double \'',
		}
	},
	'return': {
		words: 'return|enter'
	},
	
	///
	
	'shift': {
		words: 'shift|left shift'
	},
	'z': {
		words: 'zed|zee'
	},
	'x': {
		words: 'ecks'
	},
	'c': {
		words: 'see|sea'
	},
	'v': {
		words: 've'
	},
	'b': {
		words: 'be|bee'
	},
	'n': {
		words: 'en'
	},
	'm': {
		words: 'em'
	},
	'comma': {
		display: ',',
		words: 'comma',
		shiftKey: {
			key: 'less-than',
			display: '<',
			words: 'less than|left angle bracket'
		}
	},
	'period': {
		display: '.',
		words: 'period|point|dot|decimal',
		shiftKey: {
			key: 'period',
			display: '>',
			words: 'greater than|right angle bracket'
		}
	},
	'slash': {
		display: '/',
		words: 'forward slash|slash',
		shiftKey: {
			key: 'question-mark',
			display: '?',
			words: 'question mark'
		}
	},
	'right-shift': {
		words: 'right shift',
		display: 'shift'
	},
	'up': {
		words: 'arrow up|up arrow|up',
		display: '↑'
	},
	
	///
	
	'control': {
		display: 'ctrl',
		words: 'left control|control',
		modifier: 'control'
	},
	'alt': {
		display: 'alt',
		words: 'option|alt|left option|left alt',
		modifier: 'alt'
	},
	'command': {
		words: 'left command|left mac key|left windows key|command|mac key|windows key',
		display: '⌘',
		modifier: 'command'
	},
	'space': {
		words: 'space'
	},
	'right-command': {
		words: 'right command|right mac key|right windows key',
		display: '⌘',
		modifier: 'command'
	},
	'right-alt': {
		display: 'alt',
		words: 'right alt|right option',
		modifier: 'alt'
	},
	'right-control': {
		display: 'ctrl',
		words: 'right control',
		modifier: 'control'
	},
	'left': {
		words: 'arrow left|left',
		display: '←'
	},
	'down': {
		words: 'arrow down|down arrow|down',
		display: '↓'
	},
	'right': {
		words: 'arrow right|right arrow|right',
		display: '→'
	}
};

for (let f = 1; f <= 9; f++) {
	let words = ['function '+f, 'unction '+f];
	keys['f' + f] = {
		words: words.join('|'),
		display: 'F' + f
	};
}

const keyReplacements = {
	'left': 'laugh|laughed|lacked',
};

const keyMap = {};
const keyMapDisplay = {};

for (let k in keys) {
	let key = keys[k];
	
	keyMap[k] = k;
	
	if (/^[a-z]$/.test(k)) {
		// let words = '';
		keyReplacements[k.toUpperCase()] = '';
		keyReplacements[k] = '';
		
		// keys[k].words += '|'+k;
		let ws = keys[k].words.split('|');
		ws.forEach((w, i) => {
			if (i > 0 && i<ws.length) {
				keyReplacements[k] += '|';
				keyReplacements[k.toUpperCase()] += '|';
			}
			
			keyReplacements[k.toUpperCase()] += 'upper case '+w+'|capital '+w;
			keyReplacements[k] += 'letter '+w+'|let er '+w+'|letters '+w+'|lower case '+w+'|'+w;
			
			// keyReplacements[k.toUpperCase()] += '|upper case '+w+'|capital '+w;
			//
			// words += w + '|' +
			// 	'letter ' + w + '|' +
			// 	'let er ' + w + '|' +
			// 	'letters ' + w + '|' +
			// 	// 'capital ' + w + '|' +
			// 	'lower case ' + w + '|';
			// 	// 'upper case ' + w;
		});
		
		keyReplacements[k.toUpperCase()] += '|upper case '+k+'|capital '+k;
		
		//keys[k].words = words;
		keyMap[k.toUpperCase()] = k;
	}
	else {
		keyReplacements[k] = '';
		keys[k].words.split('|').forEach((w, i) => {
			if (!keyReplacements[k]) keyReplacements[k] = '';
			if (i>0) keyReplacements[k] += '|';
			keyReplacements[k] += w;
		});
	}
	
	if (key.shiftKey) {
		keyReplacements[key.shiftKey.key] = key.shiftKey.words;
		keyMap[key.shiftKey.key] = k;
		keyMapDisplay[key.shiftKey.display] = key.shiftKey.key;
	}
	else {
		if (key.display) keyMapDisplay[key.display] = k;
	}
	
	if (keyReplacements[k] === k) {
		delete keyReplacements[k];
	}
}

// console.log(keyMapDisplay);
// console.log(keyReplacements);
// console.log(keyMap);
// debugger;

const keylayout = [
	['escape', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'],
	['backtick', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'minus', 'equals', 'backspace', 'insert', 'home', 'pageup'],
	['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'left-brace', 'right-brace', 'backslash', 'delete', 'end', 'pagedown'],
	['capslock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'semi-colon', 'quote', 'return'],
	['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'comma', 'period', 'slash', 'right-shift', null, 'up'],
	['control', 'alt', 'command', 'space', 'right-command', 'right-alt', 'right-control', 'left', 'down', 'right']
];

// for (let k in keys) {
// 	let key = keys[k];
// 	// let d = key.display || k;
// 	// if (/^[a-z]$/.test(k)) {
//
// 	// keyReplacements[k] = key.words; //k+'|'+key.words;
//
// 	keyMap[k] = k;
// 	if (key.shiftKey) {
// 		keyReplacements[key.shiftKey.display] = key.shiftKey.words;
// 		keyMap[key.shiftKey.display.toLowerCase()] = k;
// 	}
// }

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

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			extensionReady: false,
			extensionConnected: false,
			websocketConnected: false,
			browserServiceId: null,
			portConnected: false,
			tabActive: false,
			jaxcoreTimeout: false,
			spokenText: null,
			processedText: [],
			highlightedKeys: {
				'left-curly-bracket': true,
				'shift': true,
				'tilde': true
			}
		};
		
		this.keyboardRef = React.createRef();
		this.hoverRef = React.createRef();
	}
	
	componentDidMount() {
		jaxcore.on('service-connected', (type, device) => {
			if (type === 'browserService') {
				this.extensionConnected(device);
			}
		});
		
		jaxcore.on('device-connected', (type, device) => {
			if (type === 'speech') {
				const speech = device;
				
				speech.on('recognize', (text) => {
					this.processText(text);
				});
			}
		});
		
		this.timeout = setTimeout(() => {
			this.setState({jaxcoreTimeout: true});
		}, 2000);
		
		jaxcore.connectBrowser();
	}
	
	processText(text) {
		const spokenText = text;
		
		text = makeReplacements(text, keyReplacements);
		
		let {processedText} = this.state;
		processedText.unshift(text);
		// highlight keys
		
		// todo: display processed keys correctly
		
		// processedText = makeReplacements(processedText, keyMapDisplay);
		// for (let key in keyMapDisplay) {
		// 	processedText = processedText.replace(new RegExp(keyMapDisplay[key],'g'), key);
		// 	// // 	let r = '(?<=\\s|^)('+key]+')(?=\\s|$)';
		// 	// // 	let regex = new RegExp(r, 'i');
		// 	// //
		// 	// // 	processedText.replace(regex, );
		// 	// // 	keyMap
		// }
		
		this.setState({
			spokenText,
			processedText
		});
	}
	
	extensionConnected(browserService) {
		browserService.on('extension-disconnected', () => {
			this.setState({
				extensionReady: false,
				extensionConnected: false,
				browserServiceId: null
			});
		});
		
		browserService.on('extension-connected', (msg) => {
			this.setState({
				extensionConnected: msg.extensionConnected,
				tabActive: msg.tabActive,
				grantedPrivileges: msg.grantedPrivileges,
				websocketConnected: msg.websocketConnected
			});
		});
		
		browserService.on('websocket-connected', (websocketConnected) => {
			this.setState({
				websocketConnected
			});
		});
		
		
		browserService.on('port-active', (portActive) => {
			this.setState({
				tabActive: portActive
			});
		});
		
		this.setState({
			extensionReady: true,
			extensionConnected: false,
			tabActive: false,
			browserServiceId: browserService.id
		});
	}
	
	render() {
		if (!this.state.extensionConnected) {
			if (this.state.jaxcoreTimeout) {
				return (<div>
					<strong>Jaxcore Not Found</strong>
					<br/>
					<br/>
					For this example you must have both the Jaxcore <a
					href="https://github.com/jaxcore/jaxcore-desktop-server">desktop application</a> AND <a
					href="https://github.com/jaxcore/jaxcore-browser-extension">browser extension</a> installed.
				</div>);
			}
			else {
				return (<div>Connecting...</div>);
			}
		}
		
		let idle = this.state.tabActive ? '' : ' (idle)';
		
		return (
			<div>
				<h1>VOICE KEYBOARD{idle}</h1>
				<ul>
					{this.state.spoken}
				</ul>
				
				{this.renderKeyboard()}
				{this.renderKeyboardHover()}
				{this.renderSpokenText()}
			
			</div>
		);
	}
	
	renderSpokenText() {
		return (<div style={{textAlign: 'center'}}>
			<strong>You Said:</strong><br/>
			{this.state.spokenText}
			
			<br/><br/>
			
			<strong>Processed Keys:</strong><br/>
			{this.state.processedText.map((text, index) => {
				return (<div key={index}>{text}</div>);
			})}
		</div>);
	}
	
	renderKeyboardHover() {
		let lines = [];
		let hoverText = '';
		if (this.state.hoverKey) {
			// hoverText = this.state.hoverKey.toUpperCase();
			let key = keys[this.state.hoverKey];
			hoverText = key.display ? key.display.toUpperCase() : this.state.hoverKey.toUpperCase();
			
			if (/^[a-z]$/.test(this.state.hoverKey)) {
				keyReplacements[this.state.hoverKey].split('|').forEach((word, key) => {
					lines.push((<div key={'uw' + key}>
						{word}
					</div>));
				});
				keyReplacements[this.state.hoverKey.toUpperCase()].split('|').forEach((word, key) => {
					lines.push((<div key={'xw' + key}>
						{word}
					</div>));
				});
			}
			else key.words.split('|').forEach((word, key) => {
				// if (word === this.state.hoverKey) return;
				lines.push((<div key={'w' + key}>
					{word}
				</div>));
			});
			
			if (key.shiftKey) {
				lines.push((<strong key="s">{key.shiftKey.display}</strong>));
				key.shiftKey.words.split('|').forEach((word, key) => {
					lines.push((<div key={'s' + key}>
						{word}
					</div>));
				});
			}
		}
		return (<div id="keyboard-hover" ref={this.hoverRef} onMouseOver={e => {
			this.hoverRef.current.style.visibility = 'hidden';
		}}>
			<strong>{hoverText}</strong>
			<div>
				{lines}
			</div>
		</div>);
	}
	
	renderKeyboard() {
		const rows = keylayout.map((row, rindex) => {
			return (<div className="row" key={rindex}>
				{
					row.map((key, kindex) => {
						if (key === null) {
							return (<div className="key-empty" key={kindex}></div>);
						}
						let k = keys[key];
						// if (!k) {
						// 	debugger;
						// 	return;
						// }
						// let displayKey = (k.display) ? k.display : k.key;
						let displayKey = k.display || key;
						
						if (/^[a-z]$/.test(displayKey)) displayKey = displayKey.toUpperCase();
						
						let displayShiftKey = (k.shiftKey) ? (
							<div className="shiftDisplay">{k.shiftKey.display}</div>) : null;
						
						let highlight = (key in this.state.highlightedKeys) || (k.shiftKey && k.shiftKey.key in this.state.highlightedKeys);
						
						let outHandler = e => {
							this.hoverTimeout = setTimeout(() => {
								this.hoverRef.current.style.visibility = 'hidden';
							}, 1000);
						};
						let hoverHandler = e => {
							clearTimeout(this.hoverTimeout);
							let node = e.target;
							while (node.nodeName !== 'A' && node.parentNode) node = node.parentNode;
							let x = Math.floor(node.offsetLeft + node.offsetWidth / 2) - 20;
							
							let y = node.offsetTop + node.offsetHeight + 1;
							
							if (x < 5) x = 5;
							if (x + 100 > window.innerWidth - 10) x = window.innerWidth - 100 - 10;
							
							this.hoverRef.current.style.left = x + 'px';
							this.hoverRef.current.style.top = y + 'px';
							
							this.setState({hoverKey: key}, () => {
								this.hoverRef.current.style.visibility = 'visible';
							});
						};
						
						let handler = e => {
							e.preventDefault();
						};
						
						let highlightClass = highlight? ' highlighted':'';
						
						return (<a href="/" onMouseOver={hoverHandler} onMouseOut={outHandler} onClick={handler}
								   className={"key key-" + key+highlightClass} key={kindex}>
							{displayShiftKey}
							<div className={displayShiftKey ? "displayWithShift" : "display"}>{displayKey}</div>
						</a>);
					})
				}
			</div>)
		});
		return (<div id='keyboard' ref={this.keyboardRef}>
			{rows}
		</div>);
	}
}

export default App;
