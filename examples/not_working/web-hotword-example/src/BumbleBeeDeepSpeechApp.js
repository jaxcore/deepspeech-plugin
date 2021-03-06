import React, {Component} from 'react';
import io from 'socket.io-client';
import numerizer from 'numerizer';
import Say from 'jaxcore-say';

import BumbleBee, {SpectrumAnalyser} from 'bumblebee-hotword';
const bumblebee = new BumbleBee();

bumblebee.setSensitivity(0.5);
bumblebee.setWorkersPath('./bumblebee-workers');
bumblebee.addHotword('bumblebee');
bumblebee.setHotword('bumblebee');

Say.setWorkers({
	'espeak': 'webworkers/espeak-en-worker.js'
});

var voice = new Say({
	language: 'en',
	profile: 'Jack'
});

class BumbleBeeDeepSpeechApp extends Component {
	constructor() {
		super();
		
		this.state = {
			started: false,
			mode: null,
			recognitionOutput: [],
			unrecognizedText: null,
			muted: false,
			recognitionOn: false,
			menuRemainingTime: 0
		};
		
		this.soundOn = new Audio('sounds/bumblebee-on.mp3');
		this.soundOff = new Audio('sounds/bumblebee-off.mp3');
	}
	
	componentDidMount() {
		this.recognitionCount = 0;
		
		this.socket = io.connect('http://localhost:4000', {});
		this.socket.on('connect', () => {
			console.log('socket connected');
			this.setState({connected: true});
		});
		
		this.socket.on('disconnect', () => {
			console.log('socket disconnected');
			this.setState({connected: false});
			this.stop();
		});
		
		this.socket.on('recognize', (text, stats) => {
			this.processSpeechRecognition(text);
		});
		
		bumblebee.on('hotword', (hotword) => {
			this.setMode('menu');
			
			bumblebee.setMuted(true);
			this.soundOn.onended = function () {
				bumblebee.setMuted(false);
			};
			this.soundOn.play();
			
			if (!this.state.recognitionOn) {
				this.recognitionOn();
			}
			
			console.log('hotword sending reset');
			// reset prevents the hotword itself from being returned by deepspeech
			this.socket.emit('microphone-reset');
		});
		
		
		bumblebee.on('data', (data) => {
			if (this.state.connected && this.state.recognitionOn) {
				this.socket.emit('stream-data', data.buffer);
			}
		});
		
		bumblebee.on('analyser', (analyser) => {
			console.log('analyser', analyser);
			var canvas = document.getElementById('oscilloscope');
			this.analyser = new SpectrumAnalyser(analyser, canvas);
			if (this.state.muted) {
				bumblebee.setMuted(true);
				this.analyser.setMuted(true);
			}
			this.analyser.start();
		});
	}
	
	processSpeechRecognition(text) {
		const {recognitionOutput} = this.state;
		
		if (this.state.mode === 'menu') {
			console.log('menu recognized:',  text);
			
			if (/^(dictation|one|on|pon)$/.test(text)) {
				this.setMode('dictation');
			}
			else if (/^(numbers|number|to|two)$/.test(text)) {
				this.setMode('numbers');
			}
			else if (/^(parrot|perrot|perrots|three)$/.test(text)) {
				this.setMode('parrot');
			}
			else if (/^(quit|exit|for|four)$/.test(text)) {
				this.menuQuit();
			}
			else {
				this.setState({
					unrecognizedText: text
				});
				this.startMenuTimer();
			}
		}
		else if (this.state.mode === 'dictation') {
			recognitionOutput.unshift({
				id: this.recognitionCount++,
				text
			});
			this.setState({
				recognitionOutput,
				unrecognizedText: null
			});
		}
		else if (this.state.mode === 'numbers') {
			
			let t = text;
			t = t.replace(/^a /, '');
			t = t.split(' ').map((r) => {
				switch (r) {
					case 'for':
						return 'four';
					case 'to':
						return 'two';
					case 'on':
						return 'one';
				}
				return r;
			}).join(' ');
			let numText = numerizer(t);
			if (numText) {
				if (typeof numText === 'string') {
					console.log('numerizer', numText);
					numText = numText.replace(/[^0-9. ]/g, "").replace(/ +/g, ' ').trim();
					if (numText) {
						console.log('numText', numText);
						let ns = numText.split(' ');
						for (let i = 0; i < ns.length; i++) {
							let id = this.recognitionCount++;
							recognitionOutput.unshift({
								text: ns[i],
								id
							});
						}
					}
					else {
						this.setState({unrecognizedText: text});
						return;
					}
				}
				else {
					console.log('number:', numText);
					recognitionOutput.unshift({
						id: this.recognitionCount++,
						text: numText
					});
				}
				this.setState({
					recognitionOutput,
					unrecognizedText: null
				});
			}
			else {
				this.setState({unrecognizedText: text});
			}
		}
		else if (this.state.mode === 'parrot') {
			recognitionOutput.unshift({
				id: this.recognitionCount++,
				text
			});
			this.setState({
				recognitionOutput,
				unrecognizedText: null
			});
			
			// mute bumblebee's microphone before using speech synthesis
			bumblebee.setMuted(true);
			
			// use speech synthessis to say the text
			voice.say(text).then(() => {
				// unmute when done
				bumblebee.setMuted(false);
			});
		}
	}
	
	setMode(mode) {
		clearInterval(this.timeoutInterval);
		this.setState({
			mode,
			recognitionOutput: [],
			unrecognizedText: null
		}, () => {
			if (mode === 'menu') {
				this.startMenuTimer();
			}
		});
	}
	startMenuTimer() {
		clearInterval(this.timeoutInterval);
		this.setState({
			menuStartTime: new Date().getTime(),
			menuRemainingTime: 10000
		});
		this.timeoutInterval = setInterval(() => {
			let menuRemainingTime = 10000 - (new Date().getTime() - this.state.menuStartTime);
			if (menuRemainingTime <= 0) {
				this.menuQuit();
			}
			else {
				this.setState({
					menuRemainingTime
				});
			}
		});
	}
	
	menuQuit() {
		this.setState({
			mode: null,
			unrecognizedText: null
		});
		clearInterval(this.timeoutInterval);
		this.soundOff.play();
		this.recognitionOff();
	}
	
	recognitionOn() {
		this.analyser.setColors('#ffff00', '#222');
		this.setState({
			recognitionOn: true,
			hotwordTime: new Date().getTime()
		});
	}
	
	recognitionOff() {
		this.analyser.setColors('#fff', '#000');
		this.setState({
			recognitionOn: false,
			mode: null
		});
	}
	
	start() {
		this.setState({
			started: true
		});
		
		bumblebee.start();
	}
	
	stop() {
		this.setState({
			started: false,
			recognitionOutput: [],
			unrecognizedText: null
		});
		this.socket.emit('stream-reset');
		bumblebee.stop();
		if (this.analyser) this.analyser.stop();
	}
	
	render() {
		return (
			<div className="App">
				<button disabled={!this.state.connected || this.state.started} onClick={e => {
					this.start()
				}}>Start
				</button>
				<button disabled={!this.state.connected || !this.state.started} onClick={e => {
					this.stop()
				}}>Stop
				</button>
				<button onClick={e => {
					this.toggleMute()
				}}>{this.state.muted ? 'Unmute' : 'Mute'}</button>
				{' '}
				<strong>Recognition: {this.state.recognitionOn ? 'ON' : 'OFF'}</strong>
				<br/>
				<canvas id="oscilloscope" width="800" height="100" />
				<br/>
				{this.renderMainInfo()}
				{this.renderMenu()}
				{this.renderRecognitionOutput()}
				{this.renderUnrecognized()}
			</div>
		);
	}
	
	renderMenu() {
		if (this.state.mode === 'menu') {
			return (
				<div>
					<div>
						<br/>
						Say one of "dictation", "numbers', "parrot", "quit", or "1", "2", "3", "4": (timeout
						in {Math.ceil(this.state.menuRemainingTime / 1000)})
					</div>
					<ol>
						<li><strong>Dictation</strong></li>
						<li><strong>Numbers</strong></li>
						<li><strong>Parrot</strong></li>
						<li><strong>Quit</strong></li>
					</ol>
				</div>);
		}
	}
	
	renderUnrecognized() {
		if (this.state.unrecognizedText) {
			return (<div>Not recognized: "{this.state.unrecognizedText}"</div>);
		}
	}
	
	renderMainInfo() {
		if (this.state.started) {
			return (<div>
				<span>Say <strong>"bumblebee"</strong> to show the menu.</span>
				<br/>
				{this.renderModeInfo()}
			</div>);
		}
	}
	
	renderModeInfo() {
		if (this.state.mode === 'dictation') {
			return (<div>
				<br/>
				<strong>Dictation Mode: </strong> <span>The results from DeepSpeech will be printed below.</span>
			</div>);
		}
		if (this.state.mode === 'numbers') {
			return (<div>
				<br/>
				<strong>Numbers Mode: </strong> <span>The numbers you speak will be shown below.</span>
			</div>);
		}
		if (this.state.mode === 'parrot') {
			return (<div>
				<br/>
				<strong>Parrot Mode:</strong>
				<span>The words you speak will be spoken back using speech synthesis.</span>
			</div>);
		}
	}
	
	toggleMute() {
		let muted = !bumblebee.muted;
		bumblebee.setMuted(muted);
		this.setState({muted});
		if (this.analyser) this.analyser.setMuted(muted);
	}
	
	renderRecognitionOutput() {
		if (this.state.mode !== 'menu') {
			return (<ul>
				{this.state.recognitionOutput.map((r) => {
					return (<li key={r.id}>{r.text}</li>);
				})}
			</ul>);
		}
	}
}

export default BumbleBeeDeepSpeechApp;
