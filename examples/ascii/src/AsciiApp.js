import React, {Component} from 'react';
import Jaxcore, {Spin, Listen, MonauralScope} from 'jaxcore-client';

import Speak from "jaxcore-speak";
import en from "jaxcore-speak/voices/en/en.json";

import ascii from './ascii.json';

global.ascii = ascii;

const asciiWords = [];
global.asciiWords = asciiWords;

function processAscii() {
	let dec, ch, words;
	for (dec in ascii) {
		ch = ascii[dec][0];
		words = ascii[dec][1];
		dec = parseInt(dec);
		if (dec >= 65 && dec <= 90) { // A-Z
			let lch = ch.toLowerCase();
			words.unshift("uppercase " + lch);
			words.unshift("upper case " + lch);
			words.unshift("capital " + lch);
		} else if (dec >= 97 && dec <= 122) { // a-z
			words.unshift("lowercase " + ch);
			words.unshift("lower case " + ch);
			words.unshift(ch);
		}
		if (words.length === 0) {
			asciiWords.push([ch, dec]);
		} else {
			words.forEach(function (word) {
				asciiWords.push([word, dec]);
			});
		}
	}
	asciiWords.sort(function (a, b) {
		
		if (a[0].length === b[0].length) {
			return parseInt(a[1]) > parseInt(b[1]);
		}
		return a[0].length < b[0].length ? 1 : -1;
	});
}

processAscii();


function processText(text) {
	let index = null;
	
	let w;
	let strIndex;
	for (let i = 0; i < asciiWords.length; i++) {
		w = asciiWords[i][0];
		
		
		let same = false;
		if (text === w) {
			index = i;
			strIndex = 0;
			same = true;
			break;
		} else {
			let reg = new RegExp("^" + w + " | " + w + " | " + w + "$");
			let m = text.match(reg);
			if (m) {
				index = i;
				strIndex = m.index;
				break;
			}
		}
	}
	if (index !== null) {
		let found = asciiWords[index][0];
		let dec = asciiWords[index][1];
		let ch = ascii[dec][0];
		let before = text.substring(0, strIndex);
		let after = text.substring(strIndex + found.length + 1);
		let ret = []; //b,found,a];
		let b = processText(before);
		let a = processText(after);
		
		if (b) ret.push(b);
		
		ret.push(dec);
		
		if (a) ret.push(a);
		let r = ret.flat();
		return r;
	} else {
		//
	}
}

global.processText = processText;

Speak.addLanguages(en);

let voice = new Speak({language: 'en/en', profile: 'Jack'});
global.voice = voice;

class AsciiApp extends Component {
	constructor() {
		super();
		this.numSpins = 0;
		this.firstRecognition = true;
		this.inputRef = React.createRef();
		this.state = {
			mouseSelected: 1,
			recognizedCharacters: [4, 6, 11],
			text: '',
			recognizedText: ''
		};
		global.app = this;
	}
	
	componentDidMount() {
		
		Listen.on('recognized', (text) => {
			console.log('recognized:', text);
			this.receiveText(text);
		});
		
		Spin.connectAll((spin) => {
			console.log('connected', spin);
			
			this.numSpins++;
			
			voice.speak('Connected Spin ' + this.numSpins);
			
			spin.on('knob', (pushed) => {
				voice.speak('knob ' + (pushed ? 'pushed' : 'released'));
			});
			
			spin.on('button', (pushed) => {
				if (pushed) {
					if (this.firstRecognition) {
						this.firstRecognition = false;
						voice.speak('voice recognition activating').then(() => {
							this.startRecording();
						});
					} else {
						this.startRecording();
					}
				} else {
					this.stopRecording();
				}
			});
		});
	}
	
	receiveText(text) {
		let recognizedCharacters = processText(text);
		if (!recognizedCharacters) recognizedCharacters = [];
		this.setState({
			recognizedText: text,
			recognizedCharacters
		});
	}
	
	render() {
		return (
			<div>
				<div className="panel">
					<button onMouseDown={e => this.startRecording()} onMouseUp={e => this.stopRecording()}>Start
					</button>
					<input ref={this.inputRef} value={this.state.text} onChange={e => this.onChangeText(e)}/>
					<br/>
					Recognized Text: {this.state.recognizedText}
					<br/>
					Processed Characters : {this.state.recognizedCharacters.map((dec) => {
					return ascii[dec][0];
				}).join(' ')}
				</div>
				
				{this.renderAscii()}
			
			</div>
		);
	}
	
	onChangeText(e) {
		this.setState({
			text: e.target.value
		});
	}
	
	renderAscii() {
		
		let i = 0;
		let words;
		let rows = [];
		let a;
		for (let dec in ascii) {
			a = ascii[dec][0];
			words = ascii[dec][1];
			
			let clss = '';
			if (this.state.mouseSelected === i) clss += 'mouseSelected ';
			if (this.state.recognizedCharacters.indexOf(i) > -1) clss += 'voiceSelected';
			
			let wordElms = [];
			
			let rowi = i;
			words.forEach((word, index) => {
				wordElms.push(<a key={index} href="/" onClick={e => this.clickRow(e, rowi, a, word)}>
					{word}
				</a>);
			});
			
			let words2 = [];
			wordElms.forEach((w, i) => {
				words2.push(w);
				if (i < words.length - 1) {
					words2.push((<span key={'s_' + i}>{' '}/{' '}</span>));
				}
			});
			
			let firstWord = words[0];
			rows.push(<tr key={i} className={clss} onClick={e => this.clickRow(e, rowi, a, firstWord)}>
				<td className="dec">{dec}</td>
				<td className="char">{a}</td>
				<td>{words2}</td>
			</tr>);
			
			i++;
		}
		
		return (<table>
			<tbody className="header">
			<tr className="header">
				<th className="dec">dec</th>
				<th className="char">char</th>
				<th className="words" colSpan="6">words</th>
			</tr>
			</tbody>
			<tbody>
			{rows}
			</tbody>
		</table>);
	}
	
	clickRow(e, i, a, word) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			mouseSelected: i
		});
		if (!word) {
			word = a;
			if (/[A-Z]/.test(word)) {
				word = "uppercase " + word;
			} else if (/[a-z]/.test(word)) {
				word = "letter " + word;
			}
		}
		
		voice.speak(word);
	}
	
	startRecording() {
		Listen.start();
	}
	
	stopRecording() {
		Listen.stop();
	}
}

export default AsciiApp;
