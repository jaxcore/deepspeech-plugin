import React, {Component} from 'react';
import Jaxcore, {Listen, MonauralScope} from 'jaxcore-client';

import wordsToNumbers from 'words-to-numbers';

const letters = 'abcdefghijklmnopqrstuvwxyz';
const letterPhonetics = {
	a: ['ah', 'and'],
	b: ['be'],
	c: ['see'],
	d: ['de'],
	e: ['he'],
	f: ['as', 'at'],
	// g: [],
	h: ['each', 'eh'],
	// i: [''],
	j: ['je'],
	k: ['kay', 'kate', 'can'],
	l: [''],
	m: [''],
	n: [''],
	o: [''],
	p: [''],
	q: [''],
	r: [''],
	s: [''],
	t: ['tea'],
	u: [''],
	v: [''],
	w: [''],
	x: [''],
	y: [''],
	z: ['']
};

function wordsToLetters(words) {
	if (words.length === 1) {
		return words;
	}
	let word = words.split(/ /)[0];
	
	for (let letter in letterPhonetics) {
		for (let p = 0; p < letterPhonetics[letter].length; p++) {
			if (word === letterPhonetics[letter][p]) {
				return letter;
			}
		}
	}
	console.log('not a letter:', words);
}

function wordsToAlphaNumberic(words) {

}

class ListenApp extends Component {
	constructor() {
		super();
		
		this.canvasRef = React.createRef();
		
		this.state = {
			isRecording: false,
			results: [],
			connectedExtension: false,
			mode: 'anything'
		};
		
		global.app = this;
	}
	
	componentDidMount() {
		Jaxcore.subscribe((jaxcoreState) => {
			
			const {state} = this;
			state.connectedExtension = jaxcoreState.connectedExtension;
			this.setState(state);
			
		});
		
		this.connect();
		
		this.micVisualization = new MonauralScope(this.canvasRef.current, {
			color: '#FF0000'
		});
		
		this.micVisualization.draw();
	}
	
	connect() {
		Jaxcore.connect(() => {
			Listen.on('recognized', (text) => {
				if (this.state.mode === 'numbers') {
					text = wordsToNumbers(text);
				} else if (this.state.mode === 'letters') {
					text = wordsToLetters(text);
				} else if (this.state.mode === 'alphanum') {
					text = wordsToAlphaNumberic(text);
				}
				
				let results = this.state.results;
				results.unshift(text);
				this.setState({
					results
				});
			});
			
			Jaxcore.connectSpins(spin => {
				console.log('spin connected', spin);
				
				spin.on('spin', (direction) => {
					console.log('spin', direction, spin.state.spinPosition);
				});
				spin.on('button', (pushed) => {
					console.log('x button', pushed);
					if (pushed) {
						this.startRecording();
					} else {
						this.stopRecording();
					}
				});
				spin.on('knob', (pushed) => {
					console.log('knob', pushed);
				});
				
			});
		});
	};
	
	render() {
		return (
			<div className="App">
				
				<canvas ref={this.canvasRef} width="300" height="300"/>
				
				<div>
					<button onMouseDown={e => this.startRecording()} onMouseUp={e => this.stopRecording()}
							onMouseOut={e => this.stopRecording()}>Start Listening
					</button>
				</div>
				
				<div>
					Recognize:
					
					&nbsp;
					<input id="anything" name="mode" type="radio" value="anything"
						   checked={this.state.mode === 'anything'} onChange={e => this.onChangeMode(e)}/>
					<label htmlFor="anything">Anything</label>
					
					&nbsp;
					<input id="numbers" name="mode" type="radio" value="numbers" checked={this.state.mode === 'numbers'}
						   onChange={e => this.onChangeMode(e)}/>
					<label htmlFor="numbers">Numbers</label>
					
					&nbsp;
					<input id="letters" name="mode" type="radio" value="letters" checked={this.state.mode === 'letters'}
						   onChange={e => this.onChangeMode(e)}/>
					<label htmlFor="letters">Letters</label>
					
					&nbsp;
					<input id="alphanum" name="mode" type="radio" value="alphanum"
						   checked={this.state.mode === 'alphanum'} onChange={e => this.onChangeMode(e)}/>
					<label htmlFor="alphanum">Alpha Numeric</label>
				</div>
				
				<div>
					<button onMouseDown={e => this.startMicVisualization()} onMouseUp={e => this.stopMicVisualization()}
							onMouseOut={e => this.stopMicVisualization()}>Test Mic
					</button>
				</div>
				
				
				<div>
					Listen Status {this.state.isRecording ? 'Recording' : 'Stopped'}
				</div>
				<div>
					Extension Status {this.state.connectedExtension ? 'Connected' : 'Disconnected'}
				</div>
				
				<br/>
				
				<div>
					Results:
				</div>
				<ul>
					{this.state.results.map((r, i) => {
						return (<li key={i}>{r}</li>);
					})}
				</ul>
			</div>
		);
	}
	
	onChangeMode(e) {
		console.log(e.target.value);
		this.setState({
			mode: e.target.value
		});
	}
	
	startRecording() {
		this.setState({
			isRecording: true
		}, () => {
			Listen.start();
			this.startMicVisualization();
		});
	}
	
	stopRecording() {
		this.setState({
			isRecording: false
		}, () => {
			Listen.stop();
			this.stopMicVisualization();
		});
	}
	
	startMicVisualization() {
		this.setState({isRecording: true});
		this.micVisualization.startRecording();
	}
	
	stopMicVisualization() {
		this.setState({isRecording: false});
		this.micVisualization.stopRecording();
	}
}

export default ListenApp;
