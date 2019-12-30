module.exports = {
	services: {
		deepspeech: {
			service: require('./lib/deepspeech-service'),
			storeType: 'service'
		}
	}
};