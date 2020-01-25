const Jaxcore = require('jaxcore');
const DeepSpeechService = require('./lib/deepspeech-service');
const {recordingStates, vadStates} = require('./lib/constants');

const plugin = {
	services: {
		deepspeech: {
			service: DeepSpeechService,
			storeType: 'client'
		}
	}
};

module.exports = plugin;

module.exports.recordingStates = recordingStates;
module.exports.vadStates = vadStates;

module.exports.start = (serviceConfig) => {
	return new Promise((resolve, reject) => {
		const jaxcore = new Jaxcore();
		jaxcore.addPlugin(plugin);
		jaxcore.startService('deepspeech', serviceConfig, function(err, deepspeech) {
			if (err) reject(err);
			if (deepspeech) resolve(deepspeech);
		});
	})
};
