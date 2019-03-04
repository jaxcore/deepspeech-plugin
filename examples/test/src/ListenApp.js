import React, {Component} from 'react';
import Jaxcore, {Listen, MonauralScope} from 'jaxcore-client';
// import MicScope from './MicScope';
import wordsToNumbers from 'words-to-numbers';

const letters = 'abcdefghijklmnopqrstuvwxyz';
const letterPhonetics = {
	a: ['ah','and'],
	b: ['be'],
	c: ['see'],
	d: ['de'],
	e: ['he'],
	f: ['as','at'],
	// g: [],
	h: ['each','eh'],
	// i: [''],
	j: ['je'],
	k: ['kay','kate','can'],
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

/*
all far
although
how far
all a
also
alpha
all saw
all that
alta

bravo
gravel
bravo
brave
better

charlie
charley

doctor
don't do
delta
dull to
della
dalton

Alfa, Bravo, Charlie, Delta, Echo, Foxtrot, Golf, Hotel, India, Juliett, Kilo, Lima, Mike, November, Oscar, Papa, Quebec, Romeo, Sierra, Tango, Uniform, Victor, Whiskey, X-ray, Yankee, Zulu
 */
function wordsToLetters(words) {
	if (words.length === 1) {
		return words;
	}
	let word = words.split(/ /)[0];
	
	for (let letter in letterPhonetics) {
		for (let p=0;p<letterPhonetics[letter].length;p++) {
			if (word === letterPhonetics[letter][p]) {
				return letter;
			}
		}
	}
	console.log('not a letter:', words);
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
		
		this.micVisualization = new MonauralScope(this.canvasRef.current);
		this.micVisualization.draw();
	}
	
	connect() {
		Listen.on('recognized', (text) => {
			if (this.state.mode === 'numbers') {
				text = wordsToNumbers(text);
			}
			else if (this.state.mode === 'letters') {
				text = wordsToLetters(text);
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
	};
	
	render() {
		return (
			<div className="App">
				
				{/*<MicScope width={300} height={300} isRecording={this.state.isRecording}/>*/}
				<canvas ref={this.canvasRef} width="300" height="300"/>
				
				<div>
					<button onMouseDown={e => this.startRecording()} onMouseUp={e => this.stopRecording()}
							onMouseOut={e => this.stopRecording()}>Start Voice Recogition
					</button>
					<span>
						<input name="mode" type="radio" value="anything" checked={this.state.mode==='anything'} onChange={e=>this.onChangeMode(e)}/> Anything&nbsp;
						<input name="mode" type="radio" value="numbers" checked={this.state.mode==='numbers'} onChange={e=>this.onChangeMode(e)}/> Numbers&nbsp;
						<input name="mode" type="radio" value="letters" checked={this.state.mode==='letters'} onChange={e=>this.onChangeMode(e)}/> Letters&nbsp;
					</span>
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
