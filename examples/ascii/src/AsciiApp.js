import React, {Component} from 'react';
import Jaxcore, {Spin, Listen, MonauralScope} from 'jaxcore-client';

import Speak from "jaxcore-speak";
import en from "jaxcore-speak/voices/en/en.json";

import ascii from './ascii.json';

const asciiWords = {};

function processAscii() {
	let words;
	for (let a in ascii) {
		words = ascii[a];
		if (!words) {
			console.log('no words for ',a);
			debugger;
		}
		asciiWords[a] = words;
	}
}
processAscii();

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
			voiceSelected: [4,6,11],
			text: '',
			recognizedText: ''
		};
		global.app = this;
	}
	
	componentDidMount() {
		
		Listen.on('recognized', (text) => {
			console.log('recognized:', text);
			this.processText(text);
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
	
	processText(text) {
		
		const asciiChars = [];
		
		this.setState({
			recognizedText: text,
			asciiChars
		});
	}
	
	render() {
		return (
			<div>
				<div className="panel">
					<button onMouseDown={e => this.startRecording()} onMouseUp={e => this.stopRecording()}>Start</button>
					<input ref={this.inputRef} value={this.state.text} onChange={e=>this.onChangeText(e)}/>
					<br/>
					Recognized Text: {this.state.recognizedText}
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
		for (let a in ascii) {
			words = ascii[a];
			
			let clss = '';
			if (this.state.mouseSelected === i) clss += 'mouseSelected ';
			if (this.state.voiceSelected.indexOf(i)>-1) clss += 'voiceSelected';
			
			let wordElms = [];
			
			let rowi = i;
			words.forEach((word,index) => {
				wordElms.push(<a href="/" onClick={e => this.clickRow(e, rowi, a, word)}>
					{word}
				</a>);
			});
			
			let words2 = [];
			wordElms.forEach((w,i) => {
				words2.push(w);
				if (i<words.length-1) {
					words2.push((<span>{' '}/{' '}</span>));
				}
			});
			
			let firstWord = words[0];
			rows.push(<tr key={i} className={clss} onClick={e=>this.clickRow(e,rowi,a,firstWord)}>
				<td className="char">{a}</td>
				<td>{words2}</td>
			</tr>);
			
			i++;
		}
		
		return (<table>
			<tbody className="header">
				<tr className="header">
					<th className="char">char</th>
					<th className="words" colspan="6">words</th>
				</tr>
			</tbody>
			{rows}
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
				word = "uppercase "+word;
			}
			else if (/[a-z]/.test(word)) {
				word = "letter "+word;
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
