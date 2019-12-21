import React, {Component} from 'react';
import io from 'socket.io-client';

const pcmBuffer = function (data) {
	let audio = new DataView(new ArrayBuffer(data.length * 2));
	for (let i = 0; i < data.length; i++) {
		let multiplier = data[i] < 0 ? 0x8000 : 0x7fff;
		let value = (data[i] * multiplier) | 0;
		audio.setInt16(i * 2, value, true);
	}
	return Buffer.from(audio.buffer);
};

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
			continuousTime: 0,
			recognitionOutput: []
		};
		
		let recognitionCount = 0;
		
		this.socket = io.connect('http://localhost:4000', {});
		this.socket.once('connect', () => {
			console.log('socket connected');
			
			this.socket.on('server-ready', () => {
				console.log('server-ready');
			});
			
			this.socket.on('recognize', (results) => {
				console.log('recognized:', results);
				const {recognitionOutput} = this.state;
				results.id = recognitionCount++;
				recognitionOutput.unshift(results);
				this.setState({recognitionOutput});
			});
			
			this.socket.emit('client-ready');
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
				{this.renderRecognitionOutput()}
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
	
	renderRecognitionOutput() {
		return (<ul>
			{this.state.recognitionOutput.map((r) => {
				return (<li key={r.id}>{r.text}</li>);
			})}
		</ul>)
	}
	
	createAudioProcessor(audioContext) {
		var processor = audioContext.createScriptProcessor(512);
		processor.onaudioprocess = (event) => {
			var data = event.inputBuffer.getChannelData(0);
			var buffer = pcmBuffer(data);

			if (this.momentaryStarted) {
				this.momentaryStarted = false;
				this.socket.emit('momentary-begin', buffer);
			}
			else {
				this.socket.emit('momentary-data', buffer);
			}
		};
		
		processor.shutdown = () => {
			processor.disconnect();
			this.onaudioprocess = null;
			this.socket.emit('momentary-end');
		};
		
		processor.connect(audioContext.destination);
		
		return processor;
	}
	
	startMomentary = e => {
		this.momentaryStarted = true;
		
		this.setState({
			momentary: true,
			momentaryStart: new Date().getTime(),
			momentaryTime: 0
		}, () => {
			
			this.momentaryInterval = setInterval(() => {
				let momentaryTime = new Date().getTime() - this.state.momentaryStart;
				this.setState({momentaryTime});
			}, 100);
			
			const audioContext = new AudioContext({
				sampleRate: 16000
			});
			this.audioContext = audioContext;
			
			const success = (stream) => {
				console.log('startRecording success');
				this.mediaStreamSource = audioContext.createMediaStreamSource(stream);
				this.processor = this.createAudioProcessor(audioContext);
				this.mediaStreamSource.connect(this.processor);
			};
			
			const fail = (e) => {
				console.log('startRecording fail');
				debugger;
			};
			
			navigator.getUserMedia(
				{
					video: false,
					audio: true
				}, success, fail);
		});
	};
	
	stopMomentary = e => {
		if (!this.state.momentary) return;
		
		this.setState({
			momentary: false,
			momentaryStop: new Date().getTime()
		}, () => {
			clearInterval(this.momentaryInterval);
			
			if (this.mediaStreamSource && this.processor) {
				this.mediaStreamSource.disconnect(this.processor);
			}
			if (this.processor) {
				this.processor.shutdown();
			}
			if (this.audioContext) {
				this.audioContext.close();
			}
			
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
