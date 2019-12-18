import React, {Component} from 'react';
import io from 'socket.io-client';

var getUserMedia = require('get-user-media-promise');
var MicrophoneStream = require('microphone-stream');

class App extends Component {
	
	constructor(props) {
		super(props);
		this.state = {
			momentary: false,
			momentaryStart: 0,
			momentaryStop: 0,
			momentaryTime: 0,
			continuous: false,
			continuousStart: 0,
			continuousStop: 0,
			continuousTime: 0
		};
		
		this.socket = io.connect('http://localhost:4000', {});
		this.socket.once('connect', () => {
			console.log('socket connected');
			
			this.socket.on('server-ready', () => {
				console.log('server-ready');
				
				this.socket.emit('client-ready');
				
				let count = 0;
				setInterval(() => {
					count++;
					this.socket.emit('client-ping', count);
				},1000);
			});
			
			this.socket.on('server-ping', (count) => {
				console.log('server-ping:', count);
			});
			
			this.socket.on('recognize', (text) => {
				console.log('recognized:', text);
			});
		});
	}
	
	render() {
		return (
			<div className="App">
				<div>
					<button disabled={this.state.continuous} onMouseDown={this.startMomentary}
							onMouseUp={this.stopMomentary} onMouseOut={this.stopMomentary}>
						Record Momentarily
					</button>
					<button disabled={this.state.momentary} onClick={this.clickContinuous}>
						{this.state.continuous ? 'Stop Continuous Recording' : 'Start Continuous Recording'}
					</button>
				</div>
				{this.renderMomentary()}
				{this.renderContinuous()}
			</div>
		);
	}
	
	renderMomentary() {
		return (<div>
			Momentary Recording {Math.round(this.state.momentaryTime / 100) / 10}s
		</div>);
	}
	
	renderContinuous() {
		return (<div>
			Continuous Recording {Math.round(this.state.continuousTime / 100) / 10}s
		</div>);
	}
	
	startMomentary = e => {
		this.momentaryStart = true;
		this.setState({
			momentary: true,
			momentaryStart: new Date().getTime(),
			momentaryTime: 0
		}, () => {
			
			this.momentaryInterval = setInterval(() => {
				let momentaryTime = new Date().getTime() - this.state.momentaryStart;
				this.setState({momentaryTime});
			}, 100);
			
			// return;
			// note: for iOS Safari, the constructor must be called in response to a tap, or else the AudioContext will remain
			// suspended and will not provide any audio data.
			this.micStream = new MicrophoneStream();
			this.micStream.on('format', function(f) {
				console.log('mic audio format:', f);
			});
			
			getUserMedia({video: false, audio: true})
			.then((stream) => {
				this.micStream.setStream(stream);
			}).catch((error) => {
				console.log(error);
			});
			
			// get Buffers (Essentially a Uint8Array DataView of the same Float32 values)
			this.micStream.on('data', (chunk) => {
				// Optionally convert the Buffer back into a Float32Array
				// (This actually just creates a new DataView - the underlying audio data is not copied or modified.)
				// var chunk = MicrophoneStream.toRaw(chunk);
				
				if (this.momentaryStart) {
					this.momentaryStart = false;
					console.log('first-chunk', chunk);
					this.socket.emit('audio-begin', chunk);
				}
				else {
					if (!this.state.momentary) {
						console.log('last chunk');
						debugger;
					}
					console.log('other-chunk', chunk);
					this.socket.emit('audio-data', chunk);
				}
				
				//...
				// note: if you set options.objectMode=true, the `data` event will output AudioBuffers instead of Buffers
			});
			
			this.micStream.on('close', (chunk) => {
				this.socket.emit('audio-end');
			});
			
			// or pipe it to another stream
			// this.micStream.pipe(/*...*/);
			
			// It also emits a format event with various details (frequency, channels, etc)
			this.micStream.on('format', function (format) {
				console.log(format);
			});
			
		});
	};
	stopMomentary = e => {
		this.setState({
			momentary: false,
			momentaryStop: new Date().getTime()
		}, () => {
			clearInterval(this.momentaryInterval);
			if (this.micStream) this.micStream.stop();
		});
	};
	
	clickContinuous = e => {
		let continuous = !this.state.continuous;
		const c = {
			continuous,
		};
		if (continuous) {
			c.continuousStart = new Date().getTime();
			c.continuousTime = 0;
			this.continuousInterval = setInterval(() => {
				let continuousTime = new Date().getTime() - this.state.continuousStart;
				this.setState({continuousTime});
			}, 100);
		}
		else {
			c.continuousStop = new Date().getTime();
			clearInterval(this.continuousInterval);
		}
		this.setState(c);
	}
}

export default App;
