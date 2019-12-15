const {Adapter} = require('jaxcore');

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
				console.log('speech recognize', text);
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
