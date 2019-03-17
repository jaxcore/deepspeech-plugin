import React, {Component} from 'react';
import Jaxcore, {Spin, Listen, MonauralScope} from 'jaxcore-client';

import Speak from "jaxcore-speak";
import en from "jaxcore-speak/voices/en/en.json";

import ascii from './ascii.json';

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
		}
	}
	
	componentDidMount() {
		this.greetings = true;
		window.addEventListener('mousedown', () => {
			if (this.greetings) {
				this.greetings = false;
				voice.speak('Greetings');
			}
		});
		
		Listen.on('recognized', (text) => {
			console.log('recognized:', text);
			this.setState({
				recognizedText: text
			});
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
		
		const rows = ascii.map((row,i) => {
			let clss = '';
			if (this.state.mouseSelected === i) clss += 'mouseSelected ';
			if (this.state.voiceSelected.indexOf(i)>-1) clss += 'voiceSelected';
			
			let words = [];
			for (let w=1;w<10;w++) {
				if (row[w]) {
					words.push(<span>
							<a href="/" onClick={e=>this.clickRow(e,i,row,w)}>
								{row[w]}
							</a>
							{' '}
						</span>);
				}
			}
			
			return (<tr key={i} className={clss} onClick={e=>this.clickRow(e,i,row,'1')}>
				<td className="dec">{row.dec}</td>
				<td className="hex">{row.hex}</td>
				<td className="char">{row['char']}</td>
				<td>{words}</td>
			</tr>);
		});
		return (<table>
			<tbody className="header">
				<tr className="header">
					<th className="dec">dec</th>
					<th className="hex">hex</th>
					<th className="char">char</th>
					<th className="words" colspan="6">words</th>
				</tr>
			</tbody>
			{rows}
		</table>);
	}
	
	clickRow(e, i, row, word) {
		console.log('click',e.target.innerHTML);
		e.preventDefault();
		e.cancelBubble = true;
		e.stopPropagation();
		this.setState({
			mouseSelected: i
		});
		voice.speak(ascii[i][word]);
	}
	
	startRecording() {
		Listen.start();
	}
	
	stopRecording() {
		Listen.stop();
	}
}

export default AsciiApp;
