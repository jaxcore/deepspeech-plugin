import React, {Component} from 'react';

const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();
jaxcore.addPlugin(require('jaxcore-websocket-plugin/websocket-client'));
jaxcore.addPlugin(require('jaxcore-websocket-plugin/browser-service'));

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			extensionReady: false,
			extensionConnected: false,
			websocketConnected: false,
			browserServiceId: null,
			portConnected: false,
			tabActive: false,
			spins: [],
			updates: [],
			spokenList: []
		}
	}
	
	componentDidMount() {
		jaxcore.on('service-connected', (type, device) => {
			if (type === 'browserService') {
				this.extensionConnected(device);
			}
		});
		
		jaxcore.on('device-connected', (type, device) => {
			if (type === 'speech') {
				
				// receive the speech device
				
				const speech = device;
				
				speech.on('recognize', (text) => {
					
					// listen for the "recognize" event
					
					const spokenList = this.state.spokenList;
					spokenList.unshift(text);
					this.setState({spokenList});
				});
			}
			
		});
		
		jaxcore.connectBrowser();
	}
	
	extensionConnected(browserService) {
		browserService.on('extension-disconnected', () => {
			debugger;
			this.setState({
				extensionReady: false,
				extensionConnected: false,
				browserServiceId: null
			});
		});
		
		browserService.on('extension-connected', (msg) => {
			this.setState({
				extensionConnected: msg.extensionConnected,
				tabActive: msg.tabActive,
				grantedPrivileges: msg.grantedPrivileges,
				websocketConnected: msg.websocketConnected
			});
		});
		
		browserService.on('websocket-connected', (websocketConnected) => {
			this.setState({
				websocketConnected
			});
		});
		
		
		browserService.on('port-active', (portActive) => {
			this.setState({
				tabActive: portActive
			});
		});
		
		this.setState({
			extensionReady: true,
			extensionConnected: false,
			tabActive: false,
			browserServiceId: browserService.id
		});
	}
	
	render() {
		return (
			<div>
				<h4>Browser Extension:</h4>
				<div>
					<div>Extension: {this.state.extensionConnected ? this.state.browserServiceId + ' Connected' : 'Disconnected'}</div>
					<div>WebSocket: {this.state.websocketConnected ? 'Connected' : 'Disconnected'}</div>
					<div>Tab: {this.state.tabActive ? 'Active' : 'Inactive'}</div>
				</div>
				
				<h4>Speech Recognition Results:</h4>
				<ul>
					{this.state.spokenList.map((text, index) => {
						return (<li key={index}>{text}</li>);
					})}
				</ul>
			
			</div>
		);
	}
}

export default App;
