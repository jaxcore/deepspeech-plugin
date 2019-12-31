import React, {Component} from 'react';
import BumbleBee, {SpectrumAnalyser} from 'bumblebee-hotword';
// import Say from 'jaxcore-say';

const ipcRenderer = window.ipcRenderer;

let bumblebee = new BumbleBee();
bumblebee.setWorkersPath('./bumblebee-workers');
bumblebee.addHotword('bumblebee', require('bumblebee-hotword/hotwords/bumblebee'));

// Say.setWorkers({
// 	'espeak': 'webworkers/espeak-all-worker.js',
// 	'sam': 'webworkers/sam-worker.js'
// });
//
// const voices = {
// 	jack: new Say({
// 		language: 'en',
// 		profile: 'Jack'
// 	})
// };

class JaxcoreDeepSpeechElectronApp extends Component {
	constructor() {
		super();
		
		this.state = {
			started: false
		};
		
		// window.jaxcoreStarted = () => {
		// 	console.log('received window.jaxcoreStarted()');
		// 	this.setState({
		// 		appStarted: true
		// 	}, () => {
		// 		// debugger;
		// 		ipcRenderer.send('ui-ready');
		// 		// this.start();
		// 	});
		// 	// debugger;
		// 	return 'acknowledged';
		// };
		
		// ipcRenderer.on('ui-begin', (arg) => {
		// 	console.log('ui begin', arg);
		// 	this.setState({
		// 		appStarted: true
		// 	}, () => {
		// 		// debugger;
		// 		this.start();
		//
		// 	});
		// });
		
	}
	
	componentWillMount() {
	}
	
	componentDidMount() {
		// ensure electron IPC is working:
		// let readyInterval = setInterval(() => {
		setTimeout(() => {
			console.log('send client-ready');
			window.ipcRenderer.send('client-ready');
		}, 1);
		ipcRenderer.on('electron-ready', () => {
			// clearInterval(readyInterval);
			console.log('electron ready');
			
			this.start();
		});
	}
	
	start() {
		
		bumblebee.on('hotword', (hotword) => {
			console.log('hotword', hotword);
			// debugger;
			// this.recognizeHotword(hotword);
		});

		bumblebee.on('data', (data) => {
			// console.log('data', data.buffer);
			ipcRenderer.send('stream-data', data);
		});

		bumblebee.on('analyser', (analyser) => {
			console.log('analyser', analyser);
			var canvas = document.getElementById('oscilloscope');
			this.analyser = new SpectrumAnalyser(analyser, canvas);
			// this.analyser.setLineColor('#fff');
			// this.analyser.setBackgroundColor('#222');
			this.analyser.start();
		});

		bumblebee.start();
		
		this.setState({started: true});
	}
	
	
	render() {
		if (!this.state.started) {
			return 'starting....';
		}
		return (<div className="App">
			<h3>Jaxcore Electron Example</h3>
			
			<div>
				<canvas id="oscilloscope" width="800" height="100" />
			</div>
			
			
		</div>);
	}
}

export default JaxcoreDeepSpeechElectronApp;