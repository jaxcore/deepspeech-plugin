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
			display: '~',
			words: 'tilde|tilda||till the|till a',
		},
	},
	'1': {
		words: 'one',
		shiftKey: {
			display: '!',
			words: 'exclamation mark|exclamation|bang|nation mark'
		}
	},
	'2': {
		words: 'two|to',
		shiftKey: {
			display: '@',
			words: 'at'
		}
	},
	'3': {
		words: 'three',
		shiftKey: {
			display: '#',
			words: 'hash|pound|number sign'
		}
	},
	'4': {
		words: 'four|for',
		shiftKey: {
			display: '$',
			words: 'dollar sign|dollar|dollars'
		}
	},
	'5': {
		words: 'five',
		shiftKey: {
			display: '%',
			words: 'per cent|per centage|percent|percentage|percent sign|percentage sign|modulus|he sent'
		}
	},
	'6': {
		words: 'six|sex',
		shiftKey: {
			display: '^',
			words: 'carrot|accent'
		}
	},
	'7': {
		words: 'seven',
		shiftKey: {
			display: '&',
			words: 'ampersand|and'
		}
	},
	'8': {
		words: 'eight',
		shiftKey: {
			display: '*',
			words: 'star|asterisk|times|time|multiply|multiply by|multiplied by'
		}
	},
	'9': {
		words: 'nine',
		shiftKey: {
			display: '(',
			words: 'left bracket'
		}
	},
	'0': {
		words: 'zero',
		shiftKey: {
			display: ')',
			words: 'right bracket'
		}
	},
	'minus': {
		display: '-',
		words: 'minus|dash|negative|subtract|subtracked by',
		shiftKey: {
			display: '_',
			words: 'underscore|under score'
		}
	},
	'equals': {
		display: '=',
		words: 'equals|equal',
		shiftKey: {
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
			display: '{',
			words: 'left curly brace|left curly bracket'
		}
	},
	'right-brace': {
		display: ']',
		words: 'right brace',
		shiftKey: {
			display: '}',
			words: 'right curly brace|right curly bracket'
		}
	},
	'backslash': {
		display: '\\',
		words: 'back slash|backslash',
		shiftKey: {
			display: '|',
			words: 'pipe|bar'
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
		words: 'a|ah'
	},
	's': {
		words: 'es'
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
		words: 'ach|each'
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
			display: ':',
			words: 'colon|collin|colin|cool and|coal and|call and',
		}
	},
	'quote': {
		display: '\'',
		words: 'quote|apostrophe',
		shiftKey: {
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
			display: '<',
			words: 'less than|left angle bracket'
		}
	},
	'period': {
		display: '.',
		words: 'period|point|dot|decimal',
		shiftKey: {
			display: '>',
			words: 'greater than|right angle bracket'
		}
	},
	'slash': {
		display: '/',
		words: 'forward slash|slash',
		shiftKey: {
			display: '?',
			words: 'question mark'
		}
	},
	'right-shift': {
		words: 'right shift',
		display: 'shift'
	},
	'up': {
		words: 'arrow up|up',
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
		words: 'arrow down|down',
		display: '↓'
	},
	'right': {
		words: 'arrow right|right',
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

for (let k in keys) {
	if (/^[a-z]$/.test(k)) {
		let words = '';
		keys[k].words = k+'|'+keys[k].words;
		keys[k].words.split('|').forEach((w, i) => {
			if (i > 0) words += '|';
			words += w + '|' +
				'letter ' + w + '|' +
				'let er ' + w + '|' +
				'letters ' + w + '|' +
				'capital ' + w + '|' +
				'lower case ' + w + '|' +
				'upper case ' + w;
		});
		keys[k].words = words;
	}
}

const keylayout = [
	['escape', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'],
	['backtick', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'minus', 'equals', 'backspace', 'insert', 'home', 'pageup'],
	['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'left-brace', 'right-brace', 'backslash', 'delete', 'end', 'pagedown'],
	['capslock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'semi-colon', 'quote', 'return'],
	['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'comma', 'period', 'slash', 'right-shift', null, 'up'],
	['control', 'alt', 'command', 'space', 'right-command', 'right-alt', 'right-control', 'left', 'down', 'right']
];

const keyReplacements = {
	'left': 'laugh|laughed|lacked',
};

for (let k in keys) {
	let key = keys[k];
	let d = key.display || k;
	keyReplacements[d] = k+'|'+key.words;
	if (key.shiftKey) {
		keyReplacements[key.shiftKey.display] = key.shiftKey.words;
	}
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
			processedText: []
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
		
		const {processedText} = this.state;
		processedText.unshift(text);
		
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
			key.words.split('|').forEach((word, key) => {
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
						if (!k) {
							debugger;
							return;
						}
						// let displayKey = (k.display) ? k.display : k.key;
						let displayKey = k.display || key;
						
						if (/^[a-z]$/.test(displayKey)) displayKey = displayKey.toUpperCase();
						
						let displayShiftKey = (k.shiftKey) ? (
							<div className="shiftDisplay">{k.shiftKey.display}</div>) : null;
						
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
						return (<a href="/" onMouseOver={hoverHandler} onMouseOut={outHandler} onClick={handler}
								   className={"key key-" + key} key={kindex}>
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
