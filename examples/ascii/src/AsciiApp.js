import React, {Component} from 'react';
import Jaxcore, {Spin, Listen, MonauralScope} from 'jaxcore-client';

import Speak from "jaxcore-speak";
import en from "jaxcore-speak/voices/en/en.json";

import interpreters from './interpreters';

//global.asciiWords = asciiWords;

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
			selectedProcessor: 'ascii'
		};
		
		this.speakScopeRef = React.createRef();
		this.listenScopeRef = React.createRef();
		
		global.app = this;
	}
	
	componentDidMount() {
		this.speakScope = new MonauralScope(this.speakScopeRef.current, {
			lineWidth: 1,
			strokeColor: '#FF0000',
			fillColor: 'rgba(255,0,0,0.1)',
			bgFillColor: 'rgba(180,64,64,0.05)',
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
			bgFillColor: 'rgba(64,64,180,0.05)',
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
		let recognizedChars = interpreters.ascii(text);
		if (!recognizedChars) recognizedChars = [];
		this.setState({
			recognizedText: text,
			recognizedChars
		});
	}
	
	render() {
		return (
			<div>
				<div className="panel">
					Recognized Text: {this.state.recognizedText}
					<br/>
					Processed Characters : {this.state.recognizedChars.map((dec) => {
					return interpreters.ascii.data[dec][0];
				}).join(' ')}
					<select className="selectedProcessor" value={this.state.selectedProcessor} onChange={e=>this.changeProcessor(e)}>
						<option value="ascii">ascii</option>
						<option value="chess">chess</option>
					</select>
					<canvas id="speak" ref={this.speakScopeRef} width="70" height="70"/>
					<canvas id="listen" ref={this.listenScopeRef} width="70" height="70"/>
				</div>
				
				{this.renderTable()}
			
			</div>
		);
	}
	
	changeProcessor(e) {
		let selectedProcessor = e.target.options[e.target.selectedIndex].value;
		this.setState({
			selectedProcessor
		});
	}
	
	onChangeText(e) {
		this.setState({
			text: e.target.value
		});
	}
	
	renderTable() {
		if (this.state.selectedProcessor === 'ascii') return this.renderAscii();
		else {
			let data = interpreters.chess.data;
			let rows = data.map((line,i) => {
				let tds = line.map((word,j) => {
					return (<td key={j}>{word}</td>);
				})
				return (<tr key={i}>
					{tds}
				</tr>);
			});
			return (<table>
				<tbody className="header">
				<tr className="header">
					<th className="dec">target</th>
					<th className="words" colSpan="6">words</th>
				</tr>
				</tbody>
				<tbody>
				{rows}
				</tbody>
			</table>);
		}
	}
	
	renderAscii() {
		
		let i = 0;
		let words;
		let rows = [];
		let a;
		for (let dec in interpreters.ascii.data) {
			a = interpreters.ascii.data[dec][0];
			words = interpreters.ascii.data[dec][1];
			
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
