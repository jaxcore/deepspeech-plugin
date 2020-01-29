import React, {Component} from 'react';
import io from 'socket.io-client';

import BumbleBee from 'bumblebee-hotword';

const bumblebee = new BumbleBee();

bumblebee.setSensitivity(0.5);
bumblebee.setWorkersPath('./bumblebee-workers');
bumblebee.addHotword('bumblebee');
bumblebee.setHotword('bumblebee');

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			connected: false,
			recording: false,
			recordingStart: 0,
			recordingTime: 0,
			recognitionOutput: []
		};
	}
	
	componentDidMount() {
		let recognitionCount = 0;
		
		this.socket = io.connect('http://localhost:4000', {});
		
		this.socket.on('connect', () => {
			console.log('socket connected');
			this.setState({connected: true});
		});
		
		this.socket.on('disconnect', () => {
			console.log('socket disconnected');
			this.setState({connected: false});
			this.stopRecording();
		});
		
		this.socket.on('recognize', (text, stats) => {
			console.log('recognized:', text, stats);
			const {recognitionOutput} = this.state;
			recognitionCount++;
			recognitionOutput.unshift({
				id: recognitionCount,
				text,
				stats
			});
			this.setState({recognitionOutput});
		});
		
		bumblebee.on('data', (data) => {
			if (this.state.connected) {
				this.socket.emit('stream-data', data.buffer);
			}
		});
	}
	
	render() {
		return (<div className="App">
			<div>
				<button disabled={!this.state.connected || this.state.recording} onClick={this.startRecording}>
					Start Recording
				</button>
				
				<button disabled={!this.state.recording} onClick={this.stopRecording}>
					Stop Recording
				</button>
				
				{this.renderTime()}
			</div>
			{this.renderRecognitionOutput()}
		</div>);
	}
	
	renderTime() {
		return (<span>
			{(Math.round(this.state.recordingTime / 100) / 10).toFixed(1)}s
		</span>);
	}
	
	renderRecognitionOutput() {
		return (<ul>
			{this.state.recognitionOutput.map((r) => {
				return (<li key={r.id}>{r.text}</li>);
			})}
		</ul>)
	}
	startRecording = e => {
		if (!this.state.recording) {
			this.recordingInterval = setInterval(() => {
				let recordingTime = new Date().getTime() - this.state.recordingStart;
				this.setState({recordingTime});
			}, 100);
			
			this.setState({
				recording: true,
				recordingStart: new Date().getTime(),
				recordingTime: 0
			}, () => {
				bumblebee.start();
			});
		}
	};
	
	stopRecording = e => {
		if (this.state.recording) {
			if (this.socket.connected) {
				this.socket.emit('stream-end');
			}
			clearInterval(this.recordingInterval);
			this.setState({
				recording: false
			}, () => {
				bumblebee.stop();
			});
		}
	};
	
}

export default App;
