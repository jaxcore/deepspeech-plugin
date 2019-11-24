const {Adapter} = require('jaxcore-plugin');

class SpeechConsoleAdapter extends Adapter {
	static getDefaultState() {
		return {
		};
	}
	
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		const {speech} = devices;
		
		// spin.rainbow(2);
		// spin.lightsOff();
		
		this.addEvents(speech, {
			recognize: function (text, stats) {
				this.log('speech recognize', text);
			}
		});
		
		speech.startContinuous();
	}
	
	
	static getServicesConfig(adapterConfig) {
		return {
			// keyboard: true
		};
	}
}

module.exports = SpeechConsoleAdapter;
