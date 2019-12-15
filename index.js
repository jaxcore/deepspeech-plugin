module.exports = require('./lib/speech');
module.exports.services = {
	speech: {
		service: require('./lib/speech-service'),
		storeType: 'service'
	}
};