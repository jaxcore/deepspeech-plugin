import React, {Component} from 'react';
import Jaxcore, {Spin, Listen, MonauralScope} from 'jaxcore-client';

import Speak from "jaxcore-speak";
import en from "jaxcore-speak/voices/en/en.json";

import interpreters, {interpreterData} from './interpreters';

global.interpreterData = interpreterData;
global.interpreters = interpreters;

Speak.addLanguages(en);

let voice = new Speak({language: 'en/en', profile: 'Jack'});
global.voice = voice;

class AsciiApp extends Component {
	constructor() {
		super();
		this.numSpins = 0;
		this.firstRecognition = true;
		this.isRecording = true;
		this.inputRef = React.createRef();
		this.state = {
			mouseSelected: null,
			recognizedChars: [],
			text: '',
			recognizedText: '',
			selectedInterpreter: 'ascii'
		};
		
		this.speakScopeRef = React.createRef();
		this.listenScopeRef = React.createRef();
		
		this.interpreters = Object.keys(interpreterData);
		
		global.app = this;
	}
	
	componentDidMount() {
		this.speakScope = new MonauralScope(this.speakScopeRef.current, {
			lineWidth: 1,
			strokeColor: '#FF0000',
			fillColor: 'rgba(255,0,0,0.1)',
			bgOnColor: 'rgba(180,64,64,0.08)',
			bgOffColor: 'rgba(180,180,180,0.08)',
			dotColor: '#FF0000',
			dotSize: 2,
			background: null
		});
		this.speakScope.draw();
		voice.setVisualizer(this.speakScope);
		
		this.listenScope = new MonauralScope(this.listenScopeRef.current, {
			lineWidth: 1,
			strokeColor: '#0000FF',
			fillColor: 'rgba(0,0,255,0.1)',
			bgOnColor: 'rgba(64,64,180,0.08)',
			bgOffColor: 'rgba(180,180,180,0.08)',
			dotColor: '#0000FF',
			dotSize: 2,
			background: null
		});
		this.listenScope.draw();
		
		window.addEventListener('keydown', (e) => {
			if (e.keyCode === 32) {
				e.preventDefault();
				this.startRecording();
			}
			// console.log('d', e.keyCode);
			
		});
		window.addEventListener('keyup', (e) => {
			if (e.keyCode === 32) {
				e.preventDefault();
				this.stopRecording();
			}
		});
		
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
		let recognizedChars = interpreters[this.state.selectedInterpreter](text);
		this.setState({
			recognizedText: text,
			recognizedChars
		});
		
		// if (this.state.selectedInterpreter === 'ascii') {
		// 	let recognizedChars = interpreters.ascii(text);
		// 	this.setState({
		// 		recognizedText: text,
		// 		recognizedChars
		// 	});
		// } else {
		// 	console.log('interpreting', text);
		// 	let recognizedWords = interpreters.chess(text);
		// 	console.log('recognizedWords', recognizedWords);
		//
		// }
	}
	
	render() {
		return (
			<div>
				<div className="panel">
					Recognized Text: {this.state.recognizedText}
					<br/>
					Interpreted Result: {this.renderInterpretedResult()}
					<select className="selectedInterpreter" value={this.state.selectedInterpreter}
							onChange={e => this.changeInterpreter(e)}>
						{ this.interpreters.map((interpreter,i) => {
							return (<option value={interpreter} key={i}>{interpreter}</option>);
						}) }
					</select>
					<canvas id="speak" ref={this.speakScopeRef} width="70" height="70"/>
					<canvas id="listen" ref={this.listenScopeRef} width="70" height="70"/>
				</div>
				
				{this.renderTable()}
			
			</div>
		);
	}
	
	renderInterpretedResult() {
		let interpreter = this.state.selectedInterpreter;
		if (interpreter === 'ascii') {
			this.state.recognizedChars.map((key) => {
				return interpreterData[interpreter][key][0];
			}).join(' ')
		}
		else {
			return this.state.recognizedChars.join(' ');
		}
	}
	
	changeInterpreter(e) {
		let selectedInterpreter = e.target.options[e.target.selectedIndex].value;
		this.setState({
			selectedInterpreter
		});
	}
	
	onChangeText(e) {
		this.setState({
			text: e.target.value
		});
	}
	
	renderTable() {
		if (this.state.selectedInterpreter === 'ascii') return this.renderAscii();
		else {
			let data = interpreterData.chess;
			let trs = [];
			let i = 0;
			for (let key in data) {
				i++;
				
				let wordLinks = [];
				data[key].forEach((word,index) => {
					wordLinks.push(<span key={index}>
						{word}
					</span>);
					if (index < data[key].length-1) {
						wordLinks.push((<span key={'s_' + index}>{' '}/{' '}</span>));
					}
				});
				
				let clss = '';
				if (this.state.mouseSelected === i) clss += 'mouseSelected ';
				if (this.state.recognizedChars.indexOf(key) > -1) clss += 'voiceSelected';
				
				let rowi = i;
				trs.push((<tr key={i} className={clss} onClick={e => this.clickTR(e, rowi, key)}>
					<td key={0}>{data[key][0]}</td>
					<td key={1}>{wordLinks}</td>
				</tr>));
			}
			return (<table>
				<tbody className="header">
				<tr className="header">
					<th className="dec">Chess</th>
				</tr>
				</tbody>
				<tbody>
				{trs}
				</tbody>
			</table>);
		}
	}
	
	clickTR(e, i, word) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			mouseSelected: i
		});
		voice.speak(word);
	}
	
	renderAscii() {
		
		let i = 0;
		let words;
		let rows = [];
		let a;
		for (let dec in interpreterData.ascii) {
			a = interpreterData.ascii[dec][0];
			words = interpreterData.ascii[dec][1];
			
			let clss = '';
			if (this.state.mouseSelected === i) clss += 'mouseSelected ';
			if (this.state.recognizedChars.indexOf(i) > -1) clss += 'voiceSelected';
			
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
		if (!this.state.isRecording) {
			Listen.start();
			this.listenScope.startRecording();
			this.setState({
				isRecording: true,
				recognizedText: '',
				recognizedChars: [],
			});
		}
	}
	
	stopRecording() {
		if (this.state.isRecording) {
			Listen.stop();
			this.listenScope.stopRecording();
			this.setState({
				isRecording: false
			});
		}
	}
}

export default AsciiApp;
